import numpy as np
from sklearn.cluster import DBSCAN

def cluster_embedding(embedding, history, eps=5):
    
    X = np.vstack(history + [embedding])
    clusterer = DBSCAN(eps=eps, min_samples=1).fit(X)
    labels = clusterer.labels_

    return int(labels[-1])
