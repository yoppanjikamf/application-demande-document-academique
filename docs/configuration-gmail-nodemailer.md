# Configuration Gmail pour Nodemailer

Ce guide explique comment obtenir les variables SMTP Gmail a mettre dans `.env` pour envoyer des emails depuis le serveur avec Nodemailer.

## 1. Preparer le compte Google

Google ne permet pas d'utiliser directement le mot de passe normal du compte Gmail pour un serveur SMTP. Il faut generer un mot de passe d'application.

Conditions importantes :

- La validation en deux etapes doit etre activee sur le compte Google.
- Le mot de passe d'application est un code de 16 caracteres.
- Si tu changes le mot de passe principal du compte Google, Google peut revoquer les mots de passe d'application.

## 2. Activer la validation en deux etapes

1. Ouvre ton compte Google : <https://myaccount.google.com/>
2. Va dans `Securite`.
3. Dans la section de connexion au compte Google, active `Validation en deux etapes`.
4. Termine la configuration avec ton telephone, une application d'authentification ou une autre methode proposee.

## 3. Creer le mot de passe d'application

1. Ouvre directement : <https://myaccount.google.com/apppasswords>
2. Connecte-toi si Google le demande.
3. Saisis un nom d'application, par exemple `OBC Documents`.
4. Clique sur `Creer`.
5. Copie le mot de passe genere par Google.

Important : copie-le tout de suite. Google ne le re-affichera pas ensuite.

## 4. Remplir `.env`

Ajoute ou remplace les variables suivantes :

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_SECURE="true"
SMTP_USER="ton-adresse@gmail.com"
SMTP_PASSWORD="mot-de-passe-application-google"
SMTP_FROM="OBC Documents <ton-adresse@gmail.com>"
```

Notes :

- `SMTP_USER` est l'adresse Gmail qui enverra les emails.
- `SMTP_PASSWORD` n'est pas ton mot de passe Gmail normal. C'est le mot de passe d'application Google.
- `SMTP_FROM` doit utiliser la meme adresse que `SMTP_USER` pour eviter des rejets SMTP.
- Ces variables ne doivent jamais commencer par `NEXT_PUBLIC_`, car elles doivent rester cote serveur.

## 5. Redemarrer le serveur

Apres modification de `.env`, redemarre Next.js :

```bash
npm run dev
```

## 6. Attention avec Supabase Auth

Configurer Nodemailer dans Next.js permet d'envoyer tes propres emails depuis le serveur applicatif.

Pour les emails envoyes directement par Supabase Auth, comme confirmation d'inscription ou reset password gere par Supabase, il faut aussi configurer un SMTP custom dans le Dashboard Supabase :

`Authentication` -> `Emails` ou `Auth` -> `SMTP Settings`, selon l'interface Supabase.

Si tu veux eviter completement les limites email Supabase, les flux email critiques doivent passer par ton serveur Next.js et Nodemailer, ou par le SMTP custom configure dans Supabase.

## 7. Champs a remplir dans Supabase SMTP

Dans le Dashboard Supabase, ouvre ton projet puis va dans la configuration SMTP de l'authentification.

Avec Gmail, remplis les champs ainsi :

```txt
Host: smtp.gmail.com
Port: 465
Username: ton-adresse@gmail.com
Password: mot-de-passe-application-google
Sender email: ton-adresse@gmail.com
Sender name: OBC Documents
Secure / SSL / TLS: active
```

Si Supabase propose un champ `Encryption`, utilise :

```txt
Encryption: SSL/TLS
```

Pour le port `465`, il faut une connexion SSL directe. Le port `587` correspond plutot a STARTTLS, mais pour simplifier la configuration Gmail, garde `465`.

## 8. A ne pas confondre

Il y a deux systemes d'envoi d'emails differents :

- Supabase SMTP custom : utilise par Supabase Auth pour les confirmations, magic links, invitations et resets de mot de passe geres par Supabase.
- Nodemailer dans Next.js : utilise par notre application pour envoyer ses propres emails metier, par exemple notifications, rendez-vous, disponibilite des documents ou emails personnalises.

Dans notre flux actuel d'inscription eleve, l'application cree le compte Supabase Auth cote serveur avec `email_confirm: true`. Cela evite de bloquer l'inscription si Supabase n'arrive pas encore a envoyer l'email de confirmation.

Tu dois quand meme configurer le SMTP Supabase si tu veux utiliser plus tard les emails Supabase pour :

- recuperation de mot de passe via Supabase ;
- invitation d'utilisateurs ;
- magic link ;
- confirmation email classique.

## 9. Verification rapide

Apres avoir configure Supabase SMTP :

1. Sauvegarde la configuration SMTP dans Supabase.
2. Utilise le bouton de test SMTP si Supabase le propose.
3. Verifie la boite Gmail `Envoyes` ou les alertes de securite Google.
4. Si l'envoi echoue, regenere un mot de passe d'application Google.
5. Verifie que `Sender email` est identique a `Username`.

Erreurs frequentes :

- utiliser le mot de passe normal Gmail au lieu du mot de passe d'application ;
- ne pas avoir active la validation en deux etapes ;
- mettre `SMTP_FROM` avec une adresse differente de `SMTP_USER` ;
- utiliser le port `465` sans SSL/TLS ;
- copier le mot de passe d'application avec des espaces involontaires.
