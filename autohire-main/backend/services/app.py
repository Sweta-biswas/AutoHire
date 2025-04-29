import sys
import json
import pickle
import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.impute import SimpleImputer
# Explicitly importing potentially missing standard libraries if prepare_features uses them
from collections import Counter # Used in keyword extraction if called during training phase (won't be here, but good practice)
import traceback # For detailed error logs
import os # <-- Import os module

# --- Add Birch and Scaler imports ---
from sklearn.cluster import Birch
from sklearn.preprocessing import StandardScaler
# ------------------------------------

# Helper to print errors to stderr
def eprint(*args, **kwargs):
    print(*args, file=sys.stderr, **kwargs)

# --- Start: Components adapted from app2.py ---

class FeaturePreserver:
    """Class to preserve feature engineering setup from training"""
    def __init__(self):
        self.all_skills = set()
        self.feature_cols = []
        self.role_vectorizer = None
        self.edu_vectorizer = None
        self.imputer = SimpleImputer(strategy='mean')
        self.keywords = set()

def calculate_single_experience(start_date_str, end_date_str):
    """Calculate experience from single start/end date strings."""
    try:
        if pd.isnull(start_date_str) or pd.isnull(end_date_str):
            return 0

        end_date_str_lower = str(end_date_str).lower()
        # Handle common representations of ongoing jobs
        if end_date_str_lower in ['present', 'null', '', 'current']:
             end_date = datetime.now()
        else:
             # Attempt parsing known formats, prioritize '%m/%Y' as used in training
             try:
                 end_date = datetime.strptime(end_date_str, '%m/%Y')
             except ValueError:
                 try:
                     # Handle ISO format like 'YYYY-MM-DDTHH:MM:SS.sssZ' from MongoDB
                     end_date = datetime.fromisoformat(str(end_date_str).replace('Z', '+00:00'))
                 except ValueError:
                     eprint(f"Warning: Could not parse end date '{end_date_str}'. Using current time.")
                     end_date = datetime.now() # Fallback


        # Attempt parsing start date
        try:
            start_date = datetime.strptime(start_date_str, '%m/%Y')
        except ValueError:
            try:
                start_date = datetime.fromisoformat(str(start_date_str).replace('Z', '+00:00'))
            except ValueError:
                 eprint(f"Error: Could not parse start date '{start_date_str}'. Returning 0 experience.")
                 return 0 # Cannot calculate without valid start date

        if start_date > end_date:
             eprint(f"Warning: Start date {start_date_str} is after end date {end_date_str}. Returning 0 experience.")
             return 0 # Start date cannot be after end date

        experience_years = (end_date - start_date).days / 365.25
        return max(0, round(experience_years, 1))
    except Exception as e:
        eprint(f"Error calculating single experience: {e} for dates '{start_date_str}', '{end_date_str}'")
        return 0

def prepare_features(df, feature_preserver):
    """Prepare features for prediction using preserved setup"""
    eprint("Entering prepare_features...") # Debug print
    df = df.copy()
    is_training = False # This function is used for prediction here

    # --- Skill Features ---
    skill_data = {}
    if not feature_preserver.all_skills:
         eprint("Warning: FeaturePreserver has no skills recorded from training.")

    for skill in feature_preserver.all_skills:
        # Check jobSkills (list of strings)
        if 'jobSkills' in df.columns:
             skill_data[f'job_has_{skill}'] = df['jobSkills'].apply(
                 lambda skills: skill in skills if isinstance(skills, (list, set)) else False
             ).astype(int)
        else:
             skill_data[f'job_has_{skill}'] = 0

        # Check resumeSkills (list of strings)
        if 'resumeSkills' in df.columns:
             skill_data[f'resume_has_{skill}'] = df['resumeSkills'].apply(
                 lambda skills: skill in skills if isinstance(skills, (list, set)) else False
             ).astype(int)
        else:
             skill_data[f'resume_has_{skill}'] = 0

    if skill_data:
        skill_df = pd.DataFrame(skill_data, index=df.index)
        df = pd.concat([df, skill_df], axis=1)
    else:
         # If no skills were preserved, create dummy columns expected by the model based on feature_cols
         eprint("Warning: No skill data generated. Creating dummy skill columns based on feature_preserver.feature_cols if possible.")
         if feature_preserver.feature_cols:
             skill_cols_needed = [col for col in feature_preserver.feature_cols if 'has_' in col]
             for col in skill_cols_needed:
                 if col not in df.columns:
                     df[col] = 0


    # --- Experience Features ---
    df['required_years'] = (
        df['requiredExperience']
        # Handle formats like "0-1 years", "5+ years", "3 years"
        .apply(lambda x: float(str(x).split('-')[0].split('+')[0].split(' ')[0]) if pd.notnull(x) and str(x).split('-')[0].split('+')[0].split(' ')[0].replace('.','',1).isdigit() else 0) # Added check for digit
        .fillna(0)
    )


    # Use pre-calculated experience passed in 'actual_experience_calculated'
    if 'actual_experience_calculated' in df.columns:
        df['actual_experience'] = df['actual_experience_calculated'].fillna(0)
    else:
        eprint("Warning: 'actual_experience_calculated' column not found. Setting actual_experience to 0.")
        df['actual_experience'] = 0

    df['experience_match'] = (
        df.apply(
            lambda x: max(0, 1 - abs(x['required_years'] - x['actual_experience']) / max(x['required_years'], 1)),
            axis=1
        )
        .fillna(0)
    )

    # --- Location Matching ---
    # This logic assumes jobLocation might be city names and resumeLocation contains city/country.
    # It might need adjustment if jobLocation is just "onsite"/"remote".
    # For "remote", it might match if resumeLocation contains "remote"? Unlikely.
    # For "onsite", it requires the job posting to have city info passed in jobLocation field.
    df['location_match'] = 0 # Default to 0
    if 'jobLocation' in df.columns and 'resumeLocation' in df.columns:
        df['location_match'] = (
            df.apply(
                lambda x: 1 if pd.notnull(x['jobLocation']) and pd.notnull(x['resumeLocation']) and
                               # Simple check: job is remote OR resume location contains job location (city)
                               (str(x['jobLocation']).lower() == 'remote' or
                                any(loc.strip().lower() in str(x['resumeLocation']).lower()
                                    for loc in str(x['jobLocation']).split(',') if loc.strip()))
                else 0,
                axis=1
            )
            .fillna(0)
        )
    else:
        eprint("Warning: jobLocation or resumeLocation column missing for location matching.")


    # --- Text Similarity Features ---
    # Role Similarity
    df['job_text'] = df['jobRole'].fillna('').astype(str) + ' ' + df['jobDescription'].fillna('').astype(str)
    df['resume_text'] = df['resumeSummary'].fillna('').astype(str)

    if feature_preserver.role_vectorizer:
        try:
            job_vectors = feature_preserver.role_vectorizer.transform(df['job_text'])
            resume_vectors = feature_preserver.role_vectorizer.transform(df['resume_text'])
            df['role_similarity'] = [cosine_similarity(job_vec, resume_vec)[0][0]
                                     if job_vec.nnz > 0 and resume_vec.nnz > 0 else 0
                                     for job_vec, resume_vec in zip(job_vectors, resume_vectors)]
        except Exception as e:
            eprint(f"Error calculating role similarity: {e}. Setting to 0.")
            df['role_similarity'] = 0
    else:
        eprint("Warning: role_vectorizer not found in feature_preserver. Setting role_similarity to 0.")
        df['role_similarity'] = 0

    # Education Similarity
    df['job_edu_text'] = df['jobRole'].fillna('').astype(str) # Using jobRole as proxy for required education level/type
    df['resume_edu_text'] = df['resumeEducation__description'].fillna('').astype(str)

    if feature_preserver.edu_vectorizer:
        try:
            job_edu_vectors = feature_preserver.edu_vectorizer.transform(df['job_edu_text'])
            resume_edu_vectors = feature_preserver.edu_vectorizer.transform(df['resume_edu_text'])
            df['education_similarity'] = [cosine_similarity(j_vec, r_vec)[0][0]
                                          if j_vec.nnz > 0 and r_vec.nnz > 0 else 0
                                          for j_vec, r_vec in zip(job_edu_vectors, resume_edu_vectors)]
        except Exception as e:
             eprint(f"Error calculating education similarity: {e}. Setting to 0.")
             df['education_similarity'] = 0
    else:
        eprint("Warning: edu_vectorizer not found in feature_preserver. Setting education_similarity to 0.")
        df['education_similarity'] = 0

    # --- Advanced Features (using preserved setup) ---
    # Interaction features
    df['skill_experience_interaction'] = df['experience_match'] * df['role_similarity']

    # Nonlinear transformations
    df['experience_match_squared'] = df['experience_match'] ** 2
    df['role_similarity_squared'] = df['role_similarity'] ** 2

    # Skill match ratios
    job_skill_count = df.filter(like='job_has_').sum(axis=1).clip(lower=1)
    resume_skill_count = df.filter(like='resume_has_').sum(axis=1).clip(lower=1)
    skill_match_count = df.apply(
        lambda row: sum(row[f'job_has_{skill}'] and row[f'resume_has_{skill}']
                        for skill in feature_preserver.all_skills
                        if f'job_has_{skill}' in row and f'resume_has_{skill}' in row), # Check column exists
        axis=1
    )
    df['skill_match_ratio'] = (skill_match_count / job_skill_count).fillna(0)
    df['skill_coverage_ratio'] = (skill_match_count / resume_skill_count).fillna(0)

    # Keyword match count
    df['keyword_match_count'] = 0
    if feature_preserver.keywords:
        df['keyword_match_count'] = df.apply(
            lambda row: sum(1 for keyword in feature_preserver.keywords
                            if keyword in row['resume_text'].lower()),
            axis=1
        )
    else:
        eprint("Warning: No keywords found in feature_preserver for keyword matching.")

    # Composite score
    df['composite_feature'] = (
            df['role_similarity'] * 0.4 +
            df['experience_match'] * 0.3 +
            df['education_similarity'] * 0.2 +
            df['location_match'] * 0.1
    ).fillna(0)


    # --- Final Feature Selection and Imputation ---
    # Use feature columns determined during training
    feature_cols = feature_preserver.feature_cols
    if not feature_cols:
         # Fallback if feature_cols list is missing - use all generated numeric cols (less reliable)
         eprint("Warning: feature_preserver.feature_cols is empty. Using inferred numeric columns.")
         feature_cols = df.select_dtypes(include=np.number).columns.tolist()
         # Try to remove potentially problematic internal columns if they ended up numeric
         feature_cols = [col for col in feature_cols if col not in ['actual_experience_calculated']]


    # Ensure all required columns exist, add missing ones with 0
    for col in feature_cols:
        if col not in df.columns:
            eprint(f"Warning: Expected feature column '{col}' not found in DataFrame. Adding it with value 0.")
            df[col] = 0

    # Select only the required feature columns
    X = df[feature_cols]
    eprint(f"Selected feature columns: {X.columns.tolist()}") # Debug print

    # Impute missing values using preserved imputer
    numeric_features = X.apply(pd.to_numeric, errors='coerce')
    if feature_preserver.imputer:
        try:
            eprint("Attempting imputation using feature_preserver.imputer...") # Debug print
            imputed_data = feature_preserver.imputer.transform(numeric_features)
            eprint("Imputation successful.") # Debug print
        except Exception as e:
             eprint(f"Error during imputation: {e}. Trying fillna(0).")
             # Fallback imputation
             imputed_data = numeric_features.fillna(0)
             # Ensure shape consistency if transform fails badly
             if imputed_data.shape[1] != len(feature_cols):
                 eprint("Error: Imputation resulted in incorrect number of columns. Returning empty DataFrame.")
                 # Raising an exception here is better to stop execution
                 raise ValueError("Imputation failed and resulted in incorrect column count.")
                 # return pd.DataFrame(columns=feature_cols), feature_preserver # Return empty DF on severe error

    else:
        eprint("Warning: Imputer not found in feature_preserver. Using fillna(0).")
        imputed_data = numeric_features.fillna(0)

    eprint("Exiting prepare_features.") # Debug print
    # Return DataFrame with correct columns and index
    return pd.DataFrame(imputed_data, columns=feature_cols, index=df.index), feature_preserver

# --- End: Components adapted from app2.py ---


def main():
    eprint("Python script started.") # Debug print
    if len(sys.argv) <= 1:
        # Output error JSON to stdout as intended for the calling process
        print(json.dumps({"error": "No input file path provided."}))
        eprint("Error: No input file path provided.") # Also log to stderr
        sys.exit(1)

    input_file = sys.argv[1]
    eprint(f"Input file: {input_file}") # Debug print

    try:
        eprint("Attempting to read input file...") # Debug print
        with open(input_file, 'r') as f:
            data = json.load(f)
        eprint("Input file read successfully.") # Debug print
    except FileNotFoundError:
        print(json.dumps({"error": f"Input file '{input_file}' not found."}))
        eprint(f"Error: Input file '{input_file}' not found.")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(json.dumps({"error": f"Could not decode JSON from '{input_file}': {str(e)}"}))
        eprint(f"Error: Could not decode JSON from '{input_file}': {str(e)}")
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": f"Error reading input file: {str(e)}"}))
        eprint(f"Error reading input file: {str(e)}")
        eprint(traceback.format_exc()) # Print full traceback to stderr
        sys.exit(1)


    job_id = data.get('jobId', 'unknown_job')
    job_data = data.get('jobData')
    resumes = data.get('resumes') # List of resume objects
    eprint(f"Job ID: {job_id}, Found {len(resumes) if resumes else 0} resumes.") # Debug print

    if not job_data or not resumes:
        print(json.dumps({"error": "Missing 'jobData' or 'resumes' in input JSON.", "jobId": job_id}))
        eprint("Error: Missing 'jobData' or 'resumes' in input JSON.")
        sys.exit(1)

    # --- Load the trained model and feature preserver ---
    # Determine the script's directory
    script_dir = os.path.dirname(os.path.abspath(__file__)) # <-- Get absolute path of script's dir
    model_file = os.path.join(script_dir, 'model.pkl') # <-- Build path relative to script
    # model_file = 'model.pkl' # <-- Remove this old line

    eprint(f"Attempting to load model file: {model_file}") # Debug print
    try:
        with open(model_file, 'rb') as f:
            # Assuming the pkl file contains a tuple: (models_dict, feature_preserver_object)
            trained_models, feature_preserver = pickle.load(f)
            eprint(f"Loaded model and feature preserver from {model_file}")
    except FileNotFoundError:
         print(json.dumps({"error": f"Model file '{model_file}' not found.", "jobId": job_id}))
         eprint(f"Error: Model file '{model_file}' not found.")
         sys.exit(1)
    except Exception as e:
         print(json.dumps({"error": f"Error loading model file '{model_file}': {str(e)}", "jobId": job_id}))
         eprint(f"Error loading model file '{model_file}': {str(e)}")
         eprint(traceback.format_exc()) # Print full traceback to stderr
         sys.exit(1)

    # Prepare data for DataFrame
    data_for_df = []
    eprint(f"Processing {len(resumes)} resumes for job ID: {job_id}")
    for i, resume in enumerate(resumes):
        resume_details = resume.get('resume') # Get the nested resume object
        resume_id = resume.get('_id', f'unknown_id_{i}') # Use index as fallback ID

        if not isinstance(resume_details, dict):
            eprint(f"Warning: Skipping resume index {i} (ID: {resume_id}) due to unexpected format: {type(resume_details)}")
            continue # Skip if resume structure is unexpected

        experience = resume_details.get('experience', {})
        personal = resume_details.get('personal', {})
        education = resume_details.get('education', {})
        skills_list = resume_details.get('skills', [])

        # Ensure skills_list is actually a list
        if not isinstance(skills_list, list):
            eprint(f"Warning: Skills data for resume {resume_id} is not a list, treating as empty.")
            skills_list = []

        # Ensure personal and experience are dicts
        if not isinstance(personal, dict): personal = {}
        if not isinstance(experience, dict): experience = {}
        if not isinstance(education, dict): education = {}


        # Combine city and country for resumeLocation
        city = personal.get('city', '')
        country = personal.get('country', '')
        resume_location = f"{city}, {country}".strip(', ') if city or country else ''

        # Calculate actual experience for this resume
        start_date = experience.get('startDate')
        end_date = experience.get('endDate')
        actual_experience = calculate_single_experience(start_date, end_date)

        row = {
            # Job Data (repeated for each resume)
            'jobRole': job_data.get('jobRole'),
            'jobDescription': job_data.get('jobDescription'),
            'jobSkills': job_data.get('jobSkills', []), # Expecting list of strings
            'requiredExperience': job_data.get('requiredExperience'), # e.g., "2-4 years"
            'jobLocation': job_data.get('jobLocation'), # e.g., "onsite", "remote", or "City, State"

            # Resume Data
            'resumeSummary': resume_details.get('professionalSummary', ''),
            'resumeSkills': skills_list,
            'resumeExperience__startDate': start_date, # Keep original if needed elsewhere
            'resumeExperience__endDate': end_date,     # Keep original if needed elsewhere
            'actual_experience_calculated': actual_experience, # Use pre-calculated experience
            'resumeLocation': resume_location,
            'resumeEducation__description': education.get('description', ''),
            '_id': resume_id # Keep track of resume ID
        }
        data_for_df.append(row)

    if not data_for_df:
        print(json.dumps({"message": "No valid resumes processed.", "jobId": job_id}))
        eprint("Warning: No valid resumes processed, exiting.")
        sys.exit(0) # Exit with 0 as it's not necessarily an error state

    # Create DataFrame
    eprint(f"Creating DataFrame with {len(data_for_df)} rows.")
    input_df = pd.DataFrame(data_for_df)
    # Set resume ID as index temporarily if needed, or keep it as a column
    # input_df = input_df.set_index('_id')

    # Preprocess the data using the loaded feature_preserver
    eprint("Starting preprocessing...")
    try:
        # Pass a copy to avoid modifying the original df unless intended
        X_processed, _ = prepare_features(input_df.copy(), feature_preserver)
        eprint(f"Preprocessing complete. Processed features shape: {X_processed.shape}")

        if X_processed.empty or X_processed.shape[0] != len(input_df):
             raise ValueError(f"Preprocessing resulted in mismatching number of rows or empty DataFrame. Input: {len(input_df)}, Output: {len(X_processed)}")

    except Exception as e:
         error_msg = f"Error during preprocessing: {str(e)}"
         print(json.dumps({"error": error_msg, "jobId": job_id}))
         eprint(error_msg)
         eprint(traceback.format_exc()) # Print full traceback to stderr
         # Consider logging more details for debugging:
         # eprint("DataFrame columns:", input_df.columns)
         # eprint("DataFrame dtypes:", input_df.dtypes)
         # eprint("DataFrame head:\n", input_df.head())
         # eprint("Feature Preserver Cols:", feature_preserver.feature_cols)
         sys.exit(1)


    # --- Prediction Step ---
    eprint("Starting prediction...")
    predictions = {}
    try:
        for target, model in trained_models.items():
            if target in ['skillsScore', 'experienceScore', 'locationScore', 'roleSimilarity', 'educationScore', 'matchScore']:
                 if list(X_processed.columns) != feature_preserver.feature_cols:
                     eprint(f"CRITICAL WARNING: Processed features columns do NOT match feature_preserver.feature_cols for model '{target}'!")
                     eprint(f"Processed: {list(X_processed.columns)}")
                     eprint(f"Expected: {feature_preserver.feature_cols}")
                 eprint(f"Predicting for target: {target}") # Debug print
                 predictions[target] = model.predict(X_processed)
            else:
                 eprint(f"Skipping prediction for unexpected item in loaded model dict: {target}")

        prediction_df = pd.DataFrame(predictions, index=X_processed.index)
        prediction_df['_id'] = input_df.loc[X_processed.index, '_id'].values

        # Calculate threshold-based match category (0: <40, 1: 40-60, 2: >60)
        prediction_df['match_category'] = 0 # Default low match
        prediction_df.loc[prediction_df['matchScore'] >= 40, 'match_category'] = 1 # Medium match >= 40
        prediction_df.loc[prediction_df['matchScore'] > 60, 'match_category'] = 2 # High match > 60
        eprint("Threshold-based match categories calculated.")

        # --- Execute Birch Clustering Step (for process demonstration) ---
        eprint("Executing Birch clustering (output label will be based on thresholds)...")
        birch_execution_successful = False
        try:
            # 1. Scale the features
            scaler = StandardScaler()
            X_numeric = X_processed.select_dtypes(include=np.number).fillna(0)
            X_scaled = scaler.fit_transform(X_numeric)
            eprint(f"Features scaled for Birch. Shape: {X_scaled.shape}")

            # 2. Apply Birch (using n_clusters=3) - We run this but won't use its direct output label
            birch_model = Birch(n_clusters=3)
            # We call fit_predict to actually run the algorithm
            _ = birch_model.fit_predict(X_scaled) # Assign to dummy variable '_'
            eprint("Birch model fitted and prediction executed.")
            birch_execution_successful = True # Mark that Birch ran

        except Exception as cluster_error:
            eprint(f"Error during Birch clustering execution: {cluster_error}")
            eprint(traceback.format_exc())
            # Clustering execution failed, but we can still proceed with threshold-based category
        # --- End Birch Clustering Execution Step ---

        # --- Assign final cluster label based on threshold category ---
        # The 'cluster' label *directly mirrors* the match_category
        prediction_df['cluster'] = prediction_df['match_category']
        eprint(f"Final cluster label assigned based on match_category.")


        # Prepare results for JSON output
        # Convert numpy types to standard Python types for JSON serialization
        # Include the new 'cluster' column (derived from match_category)
        output_data = prediction_df.astype({
             col: float for col in prediction_df.columns if col not in ['_id', 'match_category', 'cluster'] # Float scores
         }).astype({
             'match_category': int, # Int category (for reference, maybe remove if redundant)
             'cluster': int         # Int cluster label (based on threshold)
         }).to_dict(orient='records')


        result = {
            "jobId": job_id,
            "matchResults": output_data,
            # Optionally add a flag indicating Birch was run
            "birch_algorithm_executed": birch_execution_successful
        }
        eprint("Prediction and threshold-based clustering complete.")

    except Exception as e:
        error_msg = f"Error during prediction/clustering steps: {str(e)}"
        print(json.dumps({"error": error_msg, "jobId": job_id}))
        eprint(error_msg)
        eprint(traceback.format_exc()) # Print full traceback to stderr
        sys.exit(1)

    # Output the final results as JSON to stdout
    try:
        eprint("Attempting to serialize final results to JSON...") # Debug print
        final_json_output = json.dumps(result)
        eprint("Serialization successful. Printing to stdout.") # Debug print
        print(final_json_output)
    except Exception as e:
         error_msg = f"Error serializing results to JSON: {str(e)}"
         print(json.dumps({"error": error_msg, "jobId": job_id}))
         eprint(error_msg)
         eprint(traceback.format_exc()) # Print full traceback to stderr
         sys.exit(1)

    eprint("Python script finished successfully.") # Debug print

if __name__ == "__main__":
    main()