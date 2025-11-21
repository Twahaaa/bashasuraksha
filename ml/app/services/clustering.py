import numpy as np
from sklearn.cluster import DBSCAN

def cluster_embedding(embedding, history, eps=5):
    # Ensure embedding is 2D
    embedding = np.array(embedding).reshape(1, -1)

    # Convert history list → 2D array
    history_arr = np.array(history) if len(history) > 0 else np.empty((0, embedding.shape[1]))

    # Combine history + current embedding
    X = np.vstack([history_arr, embedding])

    # Run DBSCAN
    clusterer = DBSCAN(eps=eps, min_samples=1).fit(X)
    labels = clusterer.labels_

    # Last label corresponds to current embedding
    return int(labels[-1])
