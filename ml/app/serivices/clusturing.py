import numpy as np
from sklearn.cluster import DBSCAN

def cluster_embedding(embedding, history, eps=5):
    """
    history: list of numpy embeddings (previous unknown samples)
    Returns: cluster_id of newest embedding.
    """
    X = np.vstack(history + [embedding])
    clusterer = DBSCAN(eps=eps, min_samples=1).fit(X)
    labels = clusterer.labels_

    return int(labels[-1])
