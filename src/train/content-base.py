import requests
import pandas as pd

url = 'https://psserver.tk/api/allProduct'
r = requests.get(url)
data = r.json()
products = pd.DataFrame(data).dropna()

def clean_attrs(attr):
    L = []
    for i in attr:
        L.append(i["value"].lower())
    return " ".join(L)

products["attrs"] = products["attrs"].apply(clean_attrs)

products["attrs"] = products["attrs"] + " " + products["name"].str.lower()
products = products[products["name"].str.len() > 0]

products.set_index('name', inplace = True)
products["attrs"][0]


from sklearn.feature_extraction.text import TfidfVectorizer
vectorizer = TfidfVectorizer(ngram_range=(1,4))


tfidf = vectorizer.fit_transform(products["attrs"])

from sklearn.metrics.pairwise import cosine_similarity
import numpy as np


cosine_sim = cosine_similarity(tfidf, tfidf)


# function that takes in movie title as input and returns the top 10 recommended movies
def recommendations(name, cosine_sim = cosine_sim):
    recommended_products = []

    # gettin the index of the product that matches the name
    idx = indices[indices == name].index[0]
    score_series = pd.Series(cosine_sim[idx]).sort_values(ascending = False)

    # getting the indexes of the 10 most similar movies
    top_10_indexes = list(score_series.iloc[1:11].index)
    # populating the list with the titles of the best 10 matching movies
    for i in top_10_indexes:
        recommended_products.append(list(products.index)[i])

    return recommended_products

def search(query):
    query = query.lower()
    query_vec = vectorizer.transform([query])
    recommended_products = []
#     print(query_vec)
    similarity = cosine_similarity(query_vec, tfidf)
    score_series = pd.Series(similarity[0]).sort_values(ascending = False)
     # getting the indexes of the 10 most similar movies
    top_10_indexes = list(score_series.iloc[1:11].index)
    # populating the list with the titles of the best 10 matching movies
    for i in top_10_indexes:
        recommended_products.append(list(products.index)[i])

    return recommended_products

