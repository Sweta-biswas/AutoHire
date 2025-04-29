import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime
from sklearn.model_selection import train_test_split, GridSearchCV, RandomizedSearchCV, cross_val_score
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.impute import SimpleImputer
import pickle
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import Birch


class FeaturePreserver:
    """Class to preserve feature engineering setup from training"""

    def __init__(self):
        self.all_skills = set()
        self.feature_cols = []
        self.role_vectorizer = None
        self.edu_vectorizer = None
        self.imputer = SimpleImputer(strategy='mean')
        self.keywords = set()


def calculate_experience(row):
    """Calculate total experience from resume experience dates"""
    try:
        if pd.isnull(row['resumeExperience__startDate']) or pd.isnull(row['resumeExperience__endDate']):
            return 0

        end_date_str = str(row['resumeExperience__endDate']).lower()
        if end_date_str in ['present', 'null']:
            end_date = datetime.now()
        else:
            end_date = datetime.strptime(row['resumeExperience__endDate'], '%m/%Y')

        start_date = datetime.strptime(row['resumeExperience__startDate'], '%m/%Y')
        experience_years = (end_date - start_date).days / 365.25
        return max(0, round(experience_years, 1))
    except Exception as e:
        print(f"Error calculating experience: {e}")
        return 0


def calculate_total_experience(df):
    """Calculate total experience across all roles for each candidate"""
    experience_groups = df.groupby('resumeSummary')
    total_experience = {}

    for name, group in experience_groups:
        total_years = 0
        for _, row in group.iterrows():
            total_years += calculate_experience(row)
        total_experience[name] = total_years

    return total_experience


def prepare_features(df, feature_preserver=None):
    """Prepare features with consistent columns using preserved setup"""
    df = df.copy()
    is_training = feature_preserver is None

    if is_training:
        feature_preserver = FeaturePreserver()

        # Collect all skills during training
        for col in df.columns:
            if 'jobSkills' in col or 'resumeSkills' in col:
                skills = df[col].dropna().unique()
                feature_preserver.all_skills.update(skills)

    # Create skill columns using preserved skills
    skill_data = {}
    for skill in feature_preserver.all_skills:
        skill_data[f'job_has_{skill}'] = (
            df.filter(like='jobSkills')
            .apply(lambda x: x.eq(skill).any(), axis=1)
            .astype(int)
        )
        skill_data[f'resume_has_{skill}'] = (
            df.filter(like='resumeSkills')
            .apply(lambda x: x.eq(skill).any(), axis=1)
            .astype(int)
        )

    # Add skill features
    if skill_data:
        skill_df = pd.DataFrame(skill_data, index=df.index)
        df = pd.concat([df, skill_df], axis=1)

    # Experience features
    df['required_years'] = (
        df['requiredExperience']
        .apply(lambda x: float(x.split('-')[0]) if pd.notnull(x) and '-' in x else 0)
        .fillna(0)
    )

    total_experience = calculate_total_experience(df)
    df['actual_experience'] = df['resumeSummary'].map(total_experience).fillna(0)

    df['experience_match'] = (
        df.apply(
            lambda x: max(0, 1 - abs(x['required_years'] - x['actual_experience']) / max(x['required_years'], 1)),
            axis=1
        )
        .fillna(0)
    )

    # Location matching
    df['location_match'] = (
        df.apply(
            lambda x: 1 if pd.notnull(x['jobLocation']) and pd.notnull(x['resumeLocation']) and
                           any(city.strip() in x['resumeLocation'] for city in x['jobLocation'].split(','))
            else 0,
            axis=1
        )
        .fillna(0)
    )

    # Role similarity
    df['job_text'] = df['jobRole'].fillna('').astype(str) + ' ' + df['jobDescription'].fillna('').astype(str)
    df['resume_text'] = df['resumeSummary'].fillna('').astype(str)

    if is_training:
        feature_preserver.role_vectorizer = TfidfVectorizer(stop_words='english', max_features=500)
        job_vectors = feature_preserver.role_vectorizer.fit_transform(df['job_text'])
    else:
        job_vectors = feature_preserver.role_vectorizer.transform(df['job_text'])

    resume_vectors = feature_preserver.role_vectorizer.transform(df['resume_text'])
    df['role_similarity'] = [cosine_similarity(job_vec, resume_vec)[0][0]
                             for job_vec, resume_vec in zip(job_vectors, resume_vectors)]

    # Education similarity
    df['job_edu_text'] = df['jobRole'].fillna('').astype(str)
    df['resume_edu_text'] = df['resumeEducation__description'].fillna('').astype(str)

    if is_training:
        feature_preserver.edu_vectorizer = TfidfVectorizer(stop_words='english', max_features=300)
        all_edu_text = pd.concat([df['job_edu_text'], df['resume_edu_text']])
        feature_preserver.edu_vectorizer.fit(all_edu_text)

    job_edu_vectors = feature_preserver.edu_vectorizer.transform(df['job_edu_text'])
    resume_edu_vectors = feature_preserver.edu_vectorizer.transform(df['resume_edu_text'])
    df['education_similarity'] = [cosine_similarity(j_vec, r_vec)[0][0]
                                  for j_vec, r_vec in zip(job_edu_vectors, resume_edu_vectors)]

    # After creating your existing features, add these new features:

    # 1. Create interaction features between important existing features
    df['skill_experience_interaction'] = df['experience_match'] * df['role_similarity']

    # 2. Add nonlinear transformations of important features
    df['experience_match_squared'] = df['experience_match'] ** 2
    df['role_similarity_squared'] = df['role_similarity'] ** 2

    # 3. Add skill match ratio (proportion of matching skills)
    job_skill_count = df.filter(like='job_has_').sum(axis=1).clip(lower=1)
    resume_skill_count = df.filter(like='resume_has_').sum(axis=1).clip(lower=1)
    skill_match_count = df.apply(
        lambda row: sum(row[f'job_has_{skill}'] and row[f'resume_has_{skill}']
                        for skill in feature_preserver.all_skills),
        axis=1
    )
    df['skill_match_ratio'] = skill_match_count / job_skill_count
    df['skill_coverage_ratio'] = skill_match_count / resume_skill_count

    # 4. More advanced text similarity - Add keyword match counts
    if is_training:
        # Extract important keywords during training
        feature_preserver.keywords = set()
        from collections import Counter

        # Get most common words in job descriptions
        all_job_words = ' '.join(df['job_text'].fillna('')).lower().split()
        common_words = [word for word, count in Counter(all_job_words).most_common(50)
                        if len(word) > 3]  # Filter out short words
        feature_preserver.keywords.update(common_words)

    # Count keyword matches
    df['keyword_match_count'] = df.apply(
        lambda row: sum(1 for keyword in feature_preserver.keywords
                        if keyword in row['resume_text'].lower()),
        axis=1
    )

    # 5. Create a composite score
    df['composite_feature'] = (
            df['role_similarity'] * 0.4 +
            df['experience_match'] * 0.3 +
            df['education_similarity'] * 0.2 +
            df['location_match'] * 0.1
    )

    # Add these new columns to feature_cols
    additional_feature_cols = [
        'skill_experience_interaction', 'experience_match_squared',
        'role_similarity_squared', 'skill_match_ratio', 'skill_coverage_ratio',
        'keyword_match_count', 'composite_feature'
    ]

    # Collect feature columns
    feature_cols = [col for col in df.columns if 'has_' in col]
    feature_cols += ['required_years', 'actual_experience', 'experience_match',
                     'location_match', 'role_similarity', 'education_similarity']
    feature_cols += additional_feature_cols

    # Store feature columns during training
    if is_training:
        feature_preserver.feature_cols = feature_cols

    # Impute missing values using preserved setup
    numeric_features = df[feature_cols].apply(pd.to_numeric, errors='coerce')
    if is_training:
        feature_preserver.imputer.fit(numeric_features)
    imputed_data = feature_preserver.imputer.transform(numeric_features)

    return pd.DataFrame(imputed_data, columns=feature_cols, index=df.index), feature_preserver


def train_model(df):
    """Train the model and return feature preservation setup"""
    X, feature_preserver = prepare_features(df)
    y = df[['skillsScore', 'experienceScore', 'locationScore',
            'roleSimilarity', 'educationScore', 'matchScore']].fillna(0)

    # Align indices
    X, y = X.align(y, axis=0, join='inner')

    # Remove rows with all zeros in targets
    valid_targets = y[(y != 0).any(axis=1)]
    X = X.loc[valid_targets.index]
    y = y.loc[valid_targets.index]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Define hyperparameter grid
    param_grid = {
        'n_estimators': [100, 200, 300],
        'max_depth': [None, 10, 20, 30],
        'min_samples_split': [2, 5, 10],
        'min_samples_leaf': [1, 2, 4],
        'max_features': ['sqrt', 'log2', None]
    }

    # For faster execution, you can use RandomizedSearchCV instead
    # n_iter controls how many parameter combinations to try
    # cv=3 for 3-fold cross-validation

    models = {}
    metrics = {}

    for target in y.columns:
        print(f"Tuning model for {target}...")
        base_model = RandomForestRegressor(random_state=42)

        # Choose one of these search methods:
        # Option 1: Comprehensive but slower
        # model_tuner = GridSearchCV(base_model, param_grid, cv=3, scoring='r2', n_jobs=-1)

        # Option 2: Faster but less comprehensive
        model_tuner = RandomizedSearchCV(base_model, param_grid, n_iter=20,
                                         cv=3, scoring='r2', random_state=42, n_jobs=-1)

        model_tuner.fit(X_train, y_train[target])
        best_model = model_tuner.best_estimator_
        models[target] = best_model

        print(f"Best parameters for {target}: {model_tuner.best_params_}")

        preds = best_model.predict(X_test)

        # Calculate metrics including MAPE
        mae = mean_absolute_error(y_test[target], preds)
        rmse = np.sqrt(mean_squared_error(y_test[target], preds))

        # Calculate MAPE
        actual = y_test[target].values
        mape = np.mean(np.abs((actual - preds) / (actual + 1e-10))) * 100

        metrics[target] = {
            'mae': mae,
            'rmse': rmse,
            'mse': mean_squared_error(y_test[target], preds),
            'r2': r2_score(y_test[target], preds),
            'mape': mape,
            'feature_importance': dict(zip(X.columns, best_model.feature_importances_))
        }

        # Add cross-validation scores for monitoring
        cv_scores = cross_val_score(best_model, X, y[target], cv=5, scoring='r2')
        metrics[target]['cv_r2_mean'] = cv_scores.mean()
        metrics[target]['cv_r2_std'] = cv_scores.std()

        print(f"Cross-validation R² for {target}: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

    return models, metrics, feature_preserver


def predict_scores(models, feature_preserver, new_data, include_categories=True):
    """
    Predict scores using preserved feature setup and categorize match levels

    Args:
        models: Trained prediction models
        feature_preserver: Feature preservation setup
        new_data: Data to predict on
        include_categories: Whether to include match categories based on thresholds

    Returns:
        DataFrame with predicted scores and optional match categories
    """
    X, _ = prepare_features(new_data, feature_preserver)
    predictions = {}

    for target, model in models.items():
        predictions[target] = model.predict(X)

    # Create DataFrame with continuous predictions
    prediction_df = pd.DataFrame(predictions, index=new_data.index)

    if include_categories:
        # Add match category based on matchScore thresholds
        prediction_df['match_category'] = 0  # Default low match
        prediction_df.loc[(prediction_df['matchScore'] >= 40) &
                          (prediction_df['matchScore'] <= 60), 'match_category'] = 1  # Medium match
        prediction_df.loc[prediction_df['matchScore'] > 60, 'match_category'] = 2  # High match

        # Add descriptive category label
        prediction_df['match_level'] = 'Low Match (<40%)'
        prediction_df.loc[prediction_df['match_category'] == 1, 'match_level'] = 'Medium Match (40-60%)'
        prediction_df.loc[prediction_df['match_category'] == 2, 'match_level'] = 'High Match (>60%)'

    return prediction_df


# ----- NEW CLUSTERING FUNCTIONALITY -----

def cluster_candidates(df, models, feature_preserver, n_clusters=3):
    """
    Group candidates based on match score thresholds from the Random Forest predictions

    Args:
        df: DataFrame with candidate and job data
        models: Trained prediction models
        feature_preserver: Feature preservation setup
        n_clusters: Not used but kept for compatibility

    Returns:
        DataFrame with original data plus match categories and predictions
    """
    # Get feature data
    X_features, _ = prepare_features(df, feature_preserver)

    # Get predictions with match categories
    predictions = predict_scores(models, feature_preserver, df, include_categories=True)

    # Combine features and predictions for reference
    cluster_data = pd.concat([X_features, predictions], axis=1)

    # Add predictions to original data
    result_df = df.copy()
    for col in predictions.columns:
        result_df[f'predicted_{col}'] = predictions[col]

    # Use the match_category as cluster
    result_df['cluster'] = result_df['predicted_match_category']

    # Add a binary flag for high match scores (>60)
    result_df['high_match'] = (result_df['cluster'] == 2).astype(int)

    # No need for actual clustering model, but return placeholder for compatibility
    mock_model = None
    scaler = None

    return result_df, mock_model, scaler, cluster_data


def analyze_clusters(clustered_df, cluster_model, scaler, cluster_data):
    """
    Analyze the characteristics of each match category cluster

    Args:
        clustered_df: DataFrame with cluster assignments
        cluster_model: Not used in threshold-based approach
        scaler: Not used in threshold-based approach
        cluster_data: Data used for clustering

    Returns:
        Dictionary with cluster analysis
    """
    # Analyze each cluster
    cluster_analysis = {}
    category_descriptions = {
        0: "Low Match (<40%)",
        1: "Medium Match (40-60%)",
        2: "High Match (>60%)"
    }

    unique_clusters = sorted(clustered_df['cluster'].unique())

    for i in unique_clusters:
        cluster_members = clustered_df[clustered_df['cluster'] == i]
        high_match_percentage = (
                cluster_members['high_match'].mean() * 100
        )

        # Calculate average scores for this cluster
        avg_scores = {
            'avg_matchScore': cluster_members['predicted_matchScore'].mean(),
            'avg_skillsScore': cluster_members['predicted_skillsScore'].mean()
            if 'predicted_skillsScore' in cluster_members.columns else None,
            'avg_experienceScore': cluster_members['predicted_experienceScore'].mean()
            if 'predicted_experienceScore' in cluster_members.columns else None,
            'high_match_percentage': high_match_percentage,
            'size': len(cluster_members),
            'description': category_descriptions.get(i, f"Cluster {i}")
        }

        cluster_analysis[f'Cluster {i}'] = avg_scores

    return cluster_analysis


def visualize_clusters(clustered_df, cluster_data, cluster_model):
    """
    Create visualizations of threshold-based match clusters

    Args:
        clustered_df: DataFrame with cluster assignments
        cluster_data: Data used for clustering
        cluster_model: Not used in threshold-based approach
    """
    # Create scatter plot
    plt.figure(figsize=(12, 8))

    # Get unique clusters
    unique_clusters = sorted(clustered_df['cluster'].unique())

    # We'll use experience as our x-axis (a key resume feature)
    if 'actual_experience' in clustered_df.columns:
        x_values = clustered_df['actual_experience']
        x_label = 'Years of Experience (from Resume)'
    else:
        # Use index as a proxy for different resumes
        x_values = np.arange(len(clustered_df))
        x_label = 'Resume Index'

    # Use match score for y-axis
    y_values = clustered_df['predicted_matchScore']

    # Define colors and labels for the clusters
    cluster_colors = {0: 'red', 1: 'orange', 2: 'green'}
    cluster_labels = {
        0: 'Low Match (<40%)',
        1: 'Medium Match (40-60%)',
        2: 'High Match (>60%)'
    }

    # Plot each cluster
    for i in unique_clusters:
        cluster_mask = clustered_df['cluster'] == i
        if sum(cluster_mask) > 0:
            plt.scatter(
                x_values[cluster_mask],
                y_values[cluster_mask],
                marker='o',
                label=cluster_labels.get(i, f'Cluster {i}'),
                alpha=0.7,
                color=cluster_colors.get(i, 'blue'),
                s=80
            )

    # Add horizontal lines at threshold points
    plt.axhline(y=40, color='gray', linestyle='--', alpha=0.7, label='40% Threshold')
    plt.axhline(y=60, color='black', linestyle='--', alpha=0.7, label='60% Threshold')

    # Calculate and show cluster centers
    for i in unique_clusters:
        cluster_mask = clustered_df['cluster'] == i
        if sum(cluster_mask) > 0:
            avg_x = x_values[cluster_mask].mean()
            avg_y = y_values[cluster_mask].mean()
            plt.scatter(
                avg_x,
                avg_y,
                s=200,
                c='blue',
                marker='*',
                edgecolors='black',
                label=f'Cluster {i} Center' if i == unique_clusters[0] else "",
                zorder=5
            )
            plt.text(avg_x, avg_y + 2, f'C{i}', fontsize=12,
                     ha='center', va='center', fontweight='bold')

    plt.title('Candidate Resume Match Scores by Match Category')
    plt.xlabel(x_label)
    plt.ylabel('Match Score')
    plt.grid(True, linestyle='--', alpha=0.6)

    # Handle legend with duplicates removed
    handles, labels = plt.gca().get_legend_handles_labels()
    by_label = dict(zip(labels, handles))
    plt.legend(by_label.values(), by_label.keys(), loc='best')

    # Set y-axis limits with some padding
    plt.ylim(max(0, min(y_values) - 5), max(y_values) + 5)

    return plt


def get_high_match_candidates(clustered_df):
    """Extract candidates with high match scores (>60)"""
    return clustered_df[clustered_df['predicted_match_category'] == 2].sort_values(
        by='predicted_matchScore', ascending=False
    )


def analyze_high_match_distribution(clustered_df):
    """Analyze the distribution of high-match candidates across clusters"""
    cluster_counts = clustered_df['cluster'].value_counts().to_dict()
    high_match_by_cluster = clustered_df[clustered_df['high_match'] == 1]['cluster'].value_counts().to_dict()

    # Calculate percentage of high-match candidates in each cluster
    distribution = {}
    for cluster in cluster_counts:
        total = cluster_counts.get(cluster, 0)
        high_matches = high_match_by_cluster.get(cluster, 0)
        percentage = (high_matches / total * 100) if total > 0 else 0

        distribution[f'Cluster {cluster}'] = {
            'total_candidates': total,
            'high_match_candidates': high_matches,
            'percentage': percentage
        }

    return distribution


if __name__ == "__main__":
    # Load and preprocess data
    df = (
        pd.read_csv("dataset3.csv")
        .drop(columns=[
            'minSalary',
            'maxSalary',
            'resumeTitle',
            'resumeExperience__company',
            'resumeEducation__school'
        ], errors='ignore')
        .dropna(subset=[
            'skillsScore', 'experienceScore', 'locationScore',
            'roleSimilarity', 'educationScore', 'matchScore'
        ])
        .fillna({
            'jobRole': '',
            'jobDescription': '',
            'resumeEducation__description': '',
            'resumeSummary': '',
            'resumeLocation': '',
            'jobLocation': ''
        })
        .reset_index(drop=True)
    )

    # Convert text columns
    text_columns = ['jobRole', 'jobDescription', 'resumeEducation__description',
                    'resumeSummary', 'resumeLocation', 'jobLocation']
    df[text_columns] = df[text_columns].astype(str)

    # Train model and get feature preservation setup
    print("Training models...")
    trained_models, performance_metrics, feature_preserver = train_model(df)

    # === NEW: Save trained model and feature preserver ===
    with open('model.pkl', 'wb') as f:
        pickle.dump((trained_models, feature_preserver), f)
    print("\nTrained model and feature preserver saved to model.pkl")

    print("\nModel performance metrics:")
    for target, metric in performance_metrics.items():
        print(f"""
            {target}:
            - MAE: {metric['mae']:.2f}
            - RMSE: {metric['rmse']:.2f}
            - R²: {metric['r2']:.2f}
            - MAPE: {metric['mape']:.2f}%
            """)

    # Apply clustering with 3 clusters using BIRCH
    print("\nPerforming candidate clustering with BIRCH...")
    clustered_df, birch_model, data_scaler, cluster_data = cluster_candidates(
        df, trained_models, feature_preserver, n_clusters=3
    )

    # Analyze clusters
    cluster_stats = analyze_clusters(clustered_df, birch_model, data_scaler, cluster_data)

    print("\nCluster Analysis:")
    for cluster, stats in cluster_stats.items():
        print(f"{cluster}:")
        print(f"  - Size: {stats['size']} candidates")
        print(f"  - Average Match Score: {stats['avg_matchScore']:.2f}")
        print(f"  - High Match Percentage: {stats['high_match_percentage']:.2f}%")

    # Get high match candidates
    high_match_candidates = get_high_match_candidates(clustered_df)

    print(f"\nFound {len(high_match_candidates)} candidates with match scores > 60")
    print("\nTop 5 High-Match Candidates:")
    selected_columns = ['predicted_matchScore', 'cluster', 'jobRole', 'resumeSummary']
    display_columns = [col for col in selected_columns if col in high_match_candidates.columns]
    print(high_match_candidates[display_columns].head())

    # Analyze high-match distribution
    distribution = analyze_high_match_distribution(clustered_df)

    print("\nDistribution of High-Match Candidates:")
    for cluster, stats in distribution.items():
        print(
            f"{cluster}: {stats['high_match_candidates']} out of {stats['total_candidates']} ({stats['percentage']:.2f}%)")

    # Create visualization
    print("\nCreating cluster visualization with BIRCH...")
    plt = visualize_clusters(clustered_df, cluster_data, birch_model)
    plt.savefig('candidate_clusters_birch.png')
    plt.close()

    print("\nClustering complete. Visualization saved to 'candidate_clusters_birch.png'")
