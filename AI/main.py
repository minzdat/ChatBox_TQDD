from model.make_data import make_train_valid_dfs
from model.get_image_embeddings import get_image_embeddings
from transformers import DistilBertTokenizer
import torch
import matplotlib.pyplot as plt
import cv2
from model.CFG import CFG
import torch.nn.functional as F

_, valid_df = make_train_valid_dfs()
model, image_embeddings = get_image_embeddings(valid_df, "best.pt")

def find_matches(model, image_embeddings, query, image_filenames, n=3):
    tokenizer = DistilBertTokenizer.from_pretrained(CFG.text_tokenizer)
    encoded_query = tokenizer([query])
    batch = {
        key: torch.tensor(values).to(CFG.device)
        for key, values in encoded_query.items()
    }
    with torch.no_grad():
        text_features = model.text_encoder(
            input_ids=batch["input_ids"], attention_mask=batch["attention_mask"]
        )
        text_embeddings = model.text_projection(text_features)
    
    image_embeddings_n = F.normalize(image_embeddings, p=2, dim=-1)
    text_embeddings_n = F.normalize(text_embeddings, p=2, dim=-1)
    dot_similarity = text_embeddings_n @ image_embeddings_n.T
    
    values, indices = torch.topk(dot_similarity.squeeze(0), n*5)
    matches = [image_filenames[idx] for idx in indices[::5]]
    
    _, axes = plt.subplots(3, figsize=(10, 10))
    for match, ax in zip(matches, axes.flatten()):
        image = cv2.imread(f"{CFG.image_path}/{match}")
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        ax.imshow(image)
        ax.axis("off")
    
    plt.show()
find_matches(model, 
             image_embeddings,
             query="Your little one is getting pretty rowdy, so why not let them run? These kids' adidas running shoes are a great starting point for budding athletes. A breathable mesh upper and durable sole will keep them bounding in comfort, whether they're running laps or chasing friends.",
             image_filenames=valid_df['image'].values,
             n=3)