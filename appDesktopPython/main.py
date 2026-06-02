import tkinter as tk
from tkinter import messagebox


def saluer():
    """Fonction appelée lors du clic sur le bouton."""
    nom = entree.get()  # Récupère le texte saisi
    if nom.strip():  # Vérifie que le champ n'est pas vide
        label_resultat.config(
            text=f"Bonjour {nom} ! Bienvenue dans l'appli.", fg="green"
        )
    else:
        # Affiche une petite alerte si rien n'est écrit
        messagebox.showwarning("Attention", "Veuillez entrer un nom.")


# 1. Création de la fenêtre principale
fenetre = tk.Tk()
fenetre.title("Mon Appli Tcl/Tk")
fenetre.geometry("400x250")  # Largeur x Hauteur

# 2. Ajout des composants (Widgets)
# Un titre
label_titre = tk.Label(
    fenetre, text="Application de Bienvenue", font=("Helvetica", 16, "bold")
)
label_titre.pack(pady=15)  # 'pady' ajoute de l'espace vertical

# Une zone de texte explicative
label_instruction = tk.Label(fenetre, text="Entrez votre nom :")
label_instruction.pack()

# Le champ de saisie
entree = tk.Entry(fenetre, font=("Helvetica", 12), width=25)
entree.pack(pady=5)

# Le bouton pour valider
bouton_valider = tk.Button(
    fenetre,
    text="Valider",
    command=saluer,
    bg="#007BFF",
    fg="white",
    font=("Helvetica", 10, "bold"),
)
bouton_valider.pack(pady=10)

# Un label vide pour afficher le résultat
label_resultat = tk.Label(fenetre, text="", font=("Helvetica", 12, "italic"))
label_resultat.pack(pady=10)

# 3. Lancement della boucle principale (écoute les événements)
fenetre.mainloop()