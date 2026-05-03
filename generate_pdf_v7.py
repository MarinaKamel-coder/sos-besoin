"""
Generation du PDF Livrable 1 - Lab 2 - SOS-BESOIN
Equipe SuperMoms - v7 (toutes les captures UI completes)
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    HRFlowable, Image
)
from reportlab.lib.utils import ImageReader

OUTPUT_PATH = "/sessions/cool-trusting-bardeen/mnt/sos-besoin/Livrable1_Lab2_SOS-BESOIN_v7.pdf"
SHOTS_DIR = "/sessions/cool-trusting-bardeen/mnt/sos-besoin/DOCS/screenshots"

styles = getSampleStyleSheet()
PRIMARY = HexColor("#1e3a8a")
ACCENT  = HexColor("#0ea5e9")
INK     = HexColor("#0f172a")
MUTED   = HexColor("#475569")
CODEBG  = HexColor("#f1f5f9")
BORDER  = HexColor("#cbd5e1")

title_style = ParagraphStyle("TitleX", parent=styles["Title"], fontName="Helvetica-Bold",
    fontSize=28, leading=34, textColor=PRIMARY, alignment=TA_CENTER, spaceAfter=20)
subtitle_style = ParagraphStyle("SubX", parent=styles["Normal"], fontName="Helvetica",
    fontSize=14, leading=18, textColor=MUTED, alignment=TA_CENTER, spaceAfter=10)
h1 = ParagraphStyle("H1", parent=styles["Heading1"], fontName="Helvetica-Bold",
    fontSize=18, leading=22, textColor=PRIMARY, spaceBefore=14, spaceAfter=10)
h2 = ParagraphStyle("H2", parent=styles["Heading2"], fontName="Helvetica-Bold",
    fontSize=14, leading=18, textColor=ACCENT, spaceBefore=10, spaceAfter=6)
h3 = ParagraphStyle("H3", parent=styles["Heading3"], fontName="Helvetica-Bold",
    fontSize=11, leading=14, textColor=INK, spaceBefore=6, spaceAfter=3)
caption_style = ParagraphStyle("Caption", parent=styles["Normal"], fontName="Helvetica-Oblique",
    fontSize=9, leading=12, textColor=MUTED, alignment=TA_CENTER, spaceAfter=12)
body = ParagraphStyle("Body", parent=styles["Normal"], fontName="Helvetica",
    fontSize=10.5, leading=15, textColor=INK, alignment=TA_JUSTIFY, spaceAfter=6)
bullet = ParagraphStyle("Bullet", parent=body, leftIndent=18, bulletIndent=6, spaceAfter=2)
code_style = ParagraphStyle("Code", parent=styles["Code"], fontName="Courier",
    fontSize=9, leading=12, textColor=INK, backColor=CODEBG,
    borderColor=BORDER, borderWidth=0.5, borderPadding=6,
    leftIndent=4, rightIndent=4, spaceBefore=4, spaceAfter=8)
link_style = ParagraphStyle("Link", parent=body, fontName="Helvetica-Bold",
    fontSize=12, leading=16, textColor=ACCENT, alignment=TA_CENTER)
note_style = ParagraphStyle("Note", parent=body, fontName="Helvetica-Oblique",
    fontSize=10, leading=14, textColor=MUTED, leftIndent=8, rightIndent=8,
    backColor=HexColor("#fef3c7"), borderColor=HexColor("#f59e0b"),
    borderWidth=0.5, borderPadding=8, spaceBefore=6, spaceAfter=10)

cell_endpoint = ParagraphStyle("CellEndpoint", parent=body, fontName="Courier-Bold",
    fontSize=9, leading=12, textColor=PRIMARY, alignment=TA_LEFT, spaceAfter=0)
cell_methods = ParagraphStyle("CellMethods", parent=body, fontName="Helvetica-Bold",
    fontSize=9, leading=12, textColor=ACCENT, alignment=TA_LEFT, spaceAfter=0)
cell_desc = ParagraphStyle("CellDesc", parent=body, fontName="Helvetica",
    fontSize=9, leading=12, textColor=INK, alignment=TA_LEFT, spaceAfter=0)
cell_header = ParagraphStyle("CellHeader", parent=body, fontName="Helvetica-Bold",
    fontSize=10, leading=12, textColor=white, alignment=TA_CENTER, spaceAfter=0)


def hr():
    return HRFlowable(width="100%", thickness=0.7, color=BORDER, spaceBefore=4, spaceAfter=8)


def shot(filename, max_w_cm=16.5, max_h_cm=14):
    path = os.path.join(SHOTS_DIR, filename)
    if not os.path.exists(path):
        return Paragraph(f"[ Capture manquante : {filename} ]", body)
    img_reader = ImageReader(path)
    iw, ih = img_reader.getSize()
    max_w = max_w_cm * cm
    max_h = max_h_cm * cm
    ratio = min(max_w / iw, max_h / ih)
    return Image(path, width=iw * ratio, height=ih * ratio)


def http_badge(code, label):
    if code in ("200", "201"):
        hexcolor = "#16a34a"
    elif code.startswith("4"):
        hexcolor = "#d97706"
    else:
        hexcolor = "#dc2626"
    return Paragraph(
        f'<font color="{hexcolor}"><b>{code}</b></font> &middot; {label}',
        ParagraphStyle("HttpBadge", parent=h3, alignment=TA_LEFT, spaceAfter=4)
    )


def cover_page(story):
    story.append(Spacer(1, 1.2 * inch))
    story.append(Paragraph("SOS-BESOIN", title_style))
    story.append(Paragraph("Plateforme web transactionnelle de demandes urgentes", subtitle_style))
    story.append(Spacer(1, 0.3 * inch))
    story.append(hr())
    story.append(Spacer(1, 0.4 * inch))
    info = [
        ["Cours", "420-951-MA - Developpement Web 4 (Hiver 2026)"],
        ["Laboratoire", "Lab 2 - Server Actions, API Routes & Panier"],
        ["Livrable", "Livrable 1 - Document PDF"],
        ["Equipe", "SuperMoms"],
        ["Sujet du projet", "SOS-BESOIN - marketplace de demandes urgentes"],
        ["Date de remise", "27 avril 2026"],
    ]
    t = Table(info, colWidths=[4.5 * cm, 11.5 * cm])
    t.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10.5),
        ("TEXTCOLOR", (0, 0), (0, -1), PRIMARY),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("LINEBELOW", (0, 0), (-1, -2), 0.3, BORDER),
    ]))
    story.append(t)
    story.append(Spacer(1, 0.5 * inch))
    story.append(Paragraph("<b>Membres de l'equipe</b>", h2))
    members = [
        ["Marina Kamel",  "Server Actions + Zod + Formulaires (Epic A)"],
        ["Asma Ajroudi",  "API Routes + Postman (Epic B.1)"],
        ["Sonia Corbin",  "Requetes Prisma avancees + Pagination + Agregation (Epic B.2/B.3)"],
        ["Sonia Mhimdi",  "Panier client persistant + UX (Epic C)"],
    ]
    tm = Table(members, colWidths=[4.5 * cm, 11.5 * cm])
    tm.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("TEXTCOLOR", (0, 0), (0, -1), INK),
        ("TEXTCOLOR", (1, 0), (1, -1), MUTED),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BACKGROUND", (0, 0), (-1, -1), HexColor("#f8fafc")),
        ("BOX", (0, 0), (-1, -1), 0.4, BORDER),
        ("LINEBELOW", (0, 0), (-1, -2), 0.3, BORDER),
    ]))
    story.append(tm)
    story.append(Spacer(1, 0.7 * inch))
    story.append(hr())
    story.append(Paragraph(
        '<b>Lien vers le depot GitHub (public, cliquable)&nbsp;:</b>',
        ParagraphStyle("LinkTitle", parent=body, alignment=TA_CENTER, fontSize=11)
    ))
    story.append(Paragraph(
        '<a href="https://github.com/MarinaKamel-coder/sos-besoin" color="#0ea5e9"><u>https://github.com/MarinaKamel-coder/sos-besoin</u></a>',
        link_style
    ))
    story.append(PageBreak())


def toc(story):
    story.append(Paragraph("Table des matieres", h1))
    story.append(hr())
    items = [
        "1. Presentation du projet",
        "2. Lien vers le depot GitHub",
        "3. Server Actions implementees",
        "4. API Routes RESTful",
        "5. Captures d'ecran - Tests Talend API Tester",
        "6. Fonctionnement du panier",
        "7. Captures d'ecran - Interface utilisateur",
        "8. Bonus - Pagination par curseur",
    ]
    for i in items:
        story.append(Paragraph(i, body))
    story.append(PageBreak())


def section_presentation(story):
    story.append(Paragraph("1. Presentation du projet", h1))
    story.append(hr())
    story.append(Paragraph(
        "<b>SOS-BESOIN</b> est une plateforme web transactionnelle qui permet a des "
        "<b>clients</b> de publier des demandes urgentes et a des <b>prestataires</b> "
        "de soumettre des offres. Le client peut accepter une offre, l'ajouter a son <b>panier</b> "
        "et confirmer la reservation via un flux de paiement (Stripe en mode test) avec integrite "
        "transactionnelle (ACID) gere par Prisma.",
        body
    ))
    story.append(Paragraph("Stack technique", h2))
    stack = [
        ["Framework", "Next.js 16.2 (App Router)"],
        ["Langage", "TypeScript"],
        ["Base de donnees", "PostgreSQL (Neon)"],
        ["ORM", "Prisma 7.8"],
        ["Authentification", "Clerk (@clerk/nextjs ^7.0)"],
        ["Validation", "Zod"],
        ["Style", "Tailwind CSS v4"],
        ["Paiement", "Stripe (test mode) - prevu"],
    ]
    ts = Table(stack, colWidths=[4.5 * cm, 11.5 * cm])
    ts.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("TEXTCOLOR", (0, 0), (0, -1), PRIMARY),
        ("BACKGROUND", (0, 0), (0, -1), HexColor("#eff6ff")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOX", (0, 0), (-1, -1), 0.4, BORDER),
        ("LINEBELOW", (0, 0), (-1, -2), 0.3, BORDER),
    ]))
    story.append(ts)
    story.append(Paragraph("Modele de donnees principal", h2))
    story.append(Paragraph(
        "Le schema Prisma definit les entites suivantes : User, Profile, Category, "
        "ServiceRequest, RequestCategory (table de jointure N-N), Offer, <b>Cart, CartItem</b>, "
        "Booking, Payment et AdminAction. Les modeles ServiceRequest et Offer integrent un "
        "champ version (Int) qui implemente un verrouillage optimiste.",
        body
    ))
    story.append(PageBreak())


def section_github(story):
    story.append(Paragraph("2. Lien vers le depot GitHub", h1))
    story.append(hr())
    story.append(Paragraph(
        "Le depot est <b>public</b> et accessible a l'adresse suivante (URL cliquable) :",
        body
    ))
    story.append(Spacer(1, 0.2 * inch))
    box = Table([[
        Paragraph(
            '<a href="https://github.com/MarinaKamel-coder/sos-besoin" color="#0ea5e9">'
            '<b><u>https://github.com/MarinaKamel-coder/sos-besoin</u></b></a>',
            ParagraphStyle("Big", parent=link_style, fontSize=14, leading=20)
        )
    ]], colWidths=[16 * cm])
    box.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 1, ACCENT),
        ("BACKGROUND", (0, 0), (-1, -1), HexColor("#f0f9ff")),
        ("TOPPADDING", (0, 0), (-1, -1), 16),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 16),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
    ]))
    story.append(box)
    story.append(Spacer(1, 0.3 * inch))
    story.append(Paragraph(
        "<b>Contributions individuelles (git log).</b> Chaque membre de l'equipe a des "
        "commits visibles dans l'historique du projet.",
        body
    ))
    story.append(PageBreak())


def _action_table(rows):
    t = Table(rows, colWidths=[5.0 * cm, 7.5 * cm, 3.5 * cm])
    t.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
        ("BACKGROUND", (0, 1), (-1, -1), HexColor("#f8fafc")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOX", (0, 0), (-1, -1), 0.5, BORDER),
        ("INNERGRID", (0, 0), (-1, -1), 0.3, BORDER),
    ]))
    return t


def section_server_actions(story):
    story.append(Paragraph("3. Server Actions implementees", h1))
    story.append(hr())
    story.append(Paragraph(
        'Les Server Actions (Next.js App Router) sont declarees avec "use server" '
        "et appelees directement depuis les composants client via useActionState. "
        "Toutes les entrees sont validees par un schema Zod avant ecriture en base.",
        body
    ))
    story.append(Paragraph("3.1 Profil utilisateur (src/action/userActions.ts)", h2))
    story.append(_action_table([
        ["Action", "Role", "Schema Zod"],
        ["getMyProfileAction()", "Recupere le profil de l'utilisateur Clerk connecte.", "-"],
        ["updateProfileAction(state, formData)", "Upsert du profil utilisateur connecte.", "profileUpdateSchema"],
        ["deleteAccountAction()", "Supprime le compte utilisateur (cascade Prisma).", "-"],
    ]))

    story.append(Paragraph("3.2 Demandes (src/action/requestActions.ts)", h2))
    story.append(_action_table([
        ["Action", "Role", "Schema Zod"],
        ["getRequestsAction(filters?)", "Liste les demandes (avec categories et nombre d'offres).", "-"],
        ["createRequestAction(state, formData)", "Cree une demande pour le client connecte.", "requestCreateSchema"],
        ["updateRequestAction(state, formData)", "Met a jour avec verrou optimiste (version).", "requestUpdateSchema"],
        ["deleteRequestAction(id)", "Supprime une demande dont l'utilisateur est proprietaire.", "-"],
    ]))
    story.append(Paragraph(
        "<b>Verrouillage optimiste.</b> updateRequestAction utilise prisma.serviceRequest.updateMany "
        "avec un filtre where: id, version et un increment de version. Si result.count est 0, "
        "on retourne un message de conflit.",
        body
    ))

    story.append(Paragraph("3.3 Offres (src/action/offerActions.ts)", h2))
    story.append(_action_table([
        ["Action", "Role", "Schema Zod"],
        ["getOffersByRequestAction(requestId)", "Liste les offres d'une demande, tri par prix.", "-"],
        ["createOfferAction(state, formData)", "Cree une offre. Unicite (requestId, providerId).", "offerCreateSchema"],
        ["updateOfferAction(state, formData)", "Met a jour prix/message avec verrou optimiste.", "offerUpdateSchema"],
        ["deleteOfferAction(id, version)", "Retire une offre du prestataire (verrou optimiste).", "(version)"],
    ]))

    story.append(Paragraph("3.4 Panier (src/action/cart.ts)", h2))
    story.append(_action_table([
        ["Action", "Role", "Schema Zod"],
        ["getCart()", "Recupere le panier de l'utilisateur connecte (avec items).", "-"],
        ["addToCart(offerId)", "Ajoute une offre au panier (unicite cartId+offerId).", "(verifications)"],
        ["updateCartItemQuantity(itemId, qty)", "Met a jour la quantite d'un item.", "(qty >= 1)"],
        ["removeFromCart(itemId)", "Retire un item du panier.", "-"],
        ["clearCart()", "Vide entierement le panier (deleteMany).", "-"],
        ["confirmCart()", "Transforme les items en bookings (transaction Prisma).", "-"],
    ]))
    story.append(PageBreak())


def section_api(story):
    story.append(Paragraph("4. API Routes RESTful", h1))
    story.append(hr())
    story.append(Paragraph(
        "Les API Routes (Next.js App Router) exposent les ressources principales en REST. "
        "Chaque endpoint valide les payloads avec Zod et renvoie des codes HTTP standards.",
        body
    ))

    api_rows = [
        [Paragraph("Endpoint", cell_header), Paragraph("Methodes", cell_header), Paragraph("Description", cell_header)],
        [Paragraph("/api/service-requests", cell_endpoint),
         Paragraph("GET, POST", cell_methods),
         Paragraph("<b>GET</b> liste les demandes (avec client, categories, _count).<br/><b>POST</b> cree une demande validee par Zod.", cell_desc)],
        [Paragraph("/api/service-requests/[id]", cell_endpoint),
         Paragraph("GET, PUT,<br/>PATCH, DELETE", cell_methods),
         Paragraph("<b>GET</b> detail (offers + booking + payment).<br/><b>PUT</b> remplacement complet.<br/><b>PATCH</b> mise a jour partielle.<br/><b>DELETE</b> refusee si une reservation est liee.", cell_desc)],
        [Paragraph("/api/service-requests/[id]/offers", cell_endpoint),
         Paragraph("GET, POST", cell_methods),
         Paragraph("<b>GET</b> liste les offres d'une demande.<br/><b>POST</b> cree une offre pour cette demande.", cell_desc)],
        [Paragraph("/api/offers/[id]", cell_endpoint),
         Paragraph("GET, PATCH,<br/>PUT, DELETE", cell_methods),
         Paragraph("<b>GET</b> detail offre.<br/><b>PATCH</b> change le statut (ACCEPTED / REJECTED / WITHDRAWN).<br/><b>PUT</b> remplacement complet.<br/><b>DELETE</b> refusee si l'offre est liee a un booking.", cell_desc)],
    ]
    t = Table(api_rows, colWidths=[5.0 * cm, 3.5 * cm, 8.0 * cm], repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [HexColor("#ffffff"), HexColor("#f8fafc")]),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("BOX", (0, 0), (-1, -1), 0.5, BORDER),
        ("INNERGRID", (0, 0), (-1, -1), 0.3, BORDER),
    ]))
    story.append(t)

    story.append(Paragraph("4.1 Exemple : POST /api/service-requests", h2))
    story.append(Paragraph("Requete (body JSON)", h3))
    story.append(Paragraph(
        "<font face='Courier' size='9'>{<br/>"
        '&nbsp;&nbsp;"title": "Reparation climatiseur urgent",<br/>'
        '&nbsp;&nbsp;"description": "Le climatiseur ne refroidit plus depuis hier soir.",<br/>'
        '&nbsp;&nbsp;"neededAt": "2026-12-31T12:00:00.000Z",<br/>'
        '&nbsp;&nbsp;"location": "Casablanca",<br/>'
        '&nbsp;&nbsp;"clientId": "cmolg8twg00028grsoc7gp9b5",<br/>'
        '&nbsp;&nbsp;"categoryId": "cmolg8u83000c8grsf24cqw2v"<br/>'
        "}</font>",
        code_style
    ))
    story.append(Paragraph("Reponse 201 Created", h3))
    story.append(Paragraph(
        "<font face='Courier' size='9'>{<br/>"
        '&nbsp;&nbsp;"id": "cmolh7j230000jwrs6yh272tu",<br/>'
        '&nbsp;&nbsp;"title": "Reparation climatiseur urgent",<br/>'
        '&nbsp;&nbsp;"status": "OPEN",<br/>'
        '&nbsp;&nbsp;"version": 1<br/>'
        "}</font>",
        code_style
    ))
    story.append(PageBreak())


def section_postman(story):
    story.append(Paragraph("5. Captures d'ecran - Tests Talend API Tester", h1))
    story.append(hr())
    story.append(Paragraph(
        "Les API Routes du projet ont ete validees a l'aide de <b>Talend API Tester</b> "
        "(extension Chrome). Les captures suivantes illustrent les principaux scenarios "
        "de test, incluant les cas <b>nominaux (200/201)</b> et les cas d'<b>erreurs metier</b>.",
        body
    ))

    captures = [
        ("api-1-get-list.png",
         "5.1 GET /api/service-requests", "200", "Liste des demandes",
         "Recupere la liste complete des demandes avec leur client, leurs categories et le nombre d'offres."),
        ("detail d'une demande.png",
         "5.2 GET /api/service-requests/[id]", "200", "Detail d'une demande",
         "Detail complet d'une demande : client, categories, offres et booking lies."),
        ("api-2-post-create.png",
         "5.3 POST /api/service-requests", "201", "Creation d'une demande",
         "Creation d'une nouvelle demande validee par Zod ; statut initial OPEN, version 1."),
        ("api-3-patch-status.png",
         "5.4 PATCH /api/service-requests/[id]", "200", "Mise a jour partielle",
         "Modification partielle d'une demande ; succes."),
        ("api-4-delete.png",
         "5.5 DELETE /api/service-requests/[id]", "400", "Suppression refusee (regle metier)",
         "Le DELETE est correctement refuse car une reservation est liee a la demande."),
        ("api-5-validation-400.png",
         "5.6 POST /api/service-requests", "400", "Validation Zod echouee",
         "Le serveur refuse une requete avec des champs invalides ; reponse avec detail des erreurs par champ."),
        ("offre d'une demande.png",
         "5.7 GET /api/service-requests/[id]/offers", "200", "Offres d'une demande",
         "Recupere toutes les offres soumises pour une demande donnee, avec le profil du prestataire."),
        ("Creation d'une offre.png",
         "5.8 POST /api/service-requests/[id]/offers", "201", "Creation d'une offre",
         "Un prestataire soumet une offre (prix + message). Statut initial PENDING, version 1."),
        ("detail d'une offre.png",
         "5.9 GET /api/offers/[id]", "200", "Detail d'une offre",
         "Detail complet d'une offre, incluant le prestataire et la demande associee."),
        ("Demande inexistante.png",
         "5.10 POST /api/service-requests/[id]/offers", "404", "Demande introuvable",
         "Tentative de creer une offre sur un id inexistant ; renvoie \"Demande introuvable.\""),
        ("offre inexistante.png",
         "5.11 GET /api/offers/[id]", "404", "Offre introuvable",
         "Acces a une offre inexistante ; renvoie \"Offre introuvable.\""),
    ]

    for filename, label, code, short, desc in captures:
        story.append(Paragraph(label, h2))
        story.append(http_badge(code, short))
        story.append(Paragraph(desc, body))
        story.append(shot(filename, max_w_cm=16.5, max_h_cm=12))
        story.append(Paragraph(f"Capture : {filename}", caption_style))
        story.append(PageBreak())


def section_panier(story):
    story.append(Paragraph("6. Fonctionnement du panier", h1))
    story.append(hr())
    story.append(Paragraph(
        "L'<b>Epic C</b> du projet est un <b>panier client persistant</b> qui permet a un "
        "client connecte de regrouper plusieurs offres acceptees avant de proceder au "
        "paiement. La persistance est cote serveur via deux nouveaux modeles Prisma "
        "(<i>Cart</i> et <i>CartItem</i>), ce qui garantit que le contenu du panier "
        "reste disponible meme apres deconnexion ou changement d'appareil.",
        body
    ))

    story.append(Paragraph("6.1 Flux pas a pas", h2))
    story.append(Paragraph(
        "<b>1. Ajout au panier</b> &mdash; Depuis la page de detail d'une demande, un bouton "
        "<i>Ajouter au panier</i> sur chaque offre PENDING declenche la Server Action "
        "<code>addToCart(offerId)</code>. Le serveur cree (ou recupere) le <code>Cart</code> "
        "de l'utilisateur, valide qu'il n'existe pas deja un <code>CartItem</code> pour cette "
        "offre, puis insere une nouvelle ligne. Un badge avec un compteur s'affiche dans le header.",
        body
    ))
    story.append(Paragraph(
        "<b>2. Consultation du panier</b> &mdash; La page <code>/cart</code> appelle "
        "<code>getCart()</code> qui charge le panier avec ses items et les offres / demandes "
        "associees. Chaque ligne affiche le titre de la demande, le prestataire, le prix unitaire "
        "et un bouton <i>Supprimer</i>.",
        body
    ))
    story.append(Paragraph(
        "<b>3. Suppression d'un item</b> &mdash; <code>removeFromCart(itemId)</code> "
        "verifie que l'item appartient bien au panier de l'utilisateur connecte avant suppression "
        "(controle d'autorisation au niveau Server Action).",
        body
    ))
    story.append(Paragraph(
        "<b>4. Calcul du total</b> &mdash; Le sous-total est la somme des "
        "<code>price * quantity</code> de chaque <code>CartItem</code>. Une <b>commission "
        "plateforme de 10%</b> est ajoutee. Le total final = sous-total + frais.",
        body
    ))
    story.append(Paragraph(
        "<b>5. Confirmation et paiement</b> &mdash; Le bouton <i>Confirmer et proceder au paiement</i> "
        "appelle <code>confirmCart()</code> qui transforme chaque <code>CartItem</code> en "
        "<code>Booking</code> dans une transaction Prisma (<code>prisma.$transaction</code>) : "
        "creation des bookings, mise a jour des offres ACCEPTED/REJECTED, mise a jour de la demande "
        "en FILLED, et vidage du panier. Tout reussit ou tout echoue (atomicite ACID).",
        body
    ))
    story.append(Paragraph(
        "<b>6. Vider le panier</b> &mdash; <code>clearCart()</code> supprime tous les "
        "<code>CartItem</code> de l'utilisateur en une seule requete (<code>deleteMany</code>).",
        body
    ))

    story.append(Paragraph("6.2 Modeles Prisma ajoutes", h2))
    story.append(Paragraph(
        "<font face='Courier' size='9'>"
        "model Cart {<br/>"
        "&nbsp;&nbsp;id        String   @id @default(cuid())<br/>"
        "&nbsp;&nbsp;userId    String   @unique<br/>"
        "&nbsp;&nbsp;user      User     @relation(...)<br/>"
        "&nbsp;&nbsp;items     CartItem[]<br/>"
        "&nbsp;&nbsp;createdAt DateTime @default(now())<br/>"
        "&nbsp;&nbsp;updatedAt DateTime @updatedAt<br/>"
        "}<br/><br/>"
        "model CartItem {<br/>"
        "&nbsp;&nbsp;id        String   @id @default(cuid())<br/>"
        "&nbsp;&nbsp;cartId    String<br/>"
        "&nbsp;&nbsp;offerId   String<br/>"
        "&nbsp;&nbsp;quantity  Int      @default(1)<br/>"
        "&nbsp;&nbsp;cart      Cart     @relation(...)<br/>"
        "&nbsp;&nbsp;offer     Offer    @relation(...)<br/>"
        "&nbsp;&nbsp;@@unique([cartId, offerId])<br/>"
        "}"
        "</font>",
        code_style
    ))

    story.append(Paragraph(
        "Migration : <code>prisma/migrations/20260430052150_add_cart_cartitem/</code>.",
        body
    ))
    story.append(PageBreak())


def section_ui(story):
    story.append(Paragraph("7. Captures d'ecran - Interface utilisateur", h1))
    story.append(hr())
    story.append(Paragraph(
        "Les captures suivantes illustrent les ecrans principaux de l'application. "
        "L'interface s'adapte automatiquement au mode clair / sombre du systeme de "
        "l'utilisateur grace aux classes Tailwind <code>dark:</code>. La pagination "
        "est implementee dans <code>src/components/Pagination.tsx</code> et la barre "
        "de recherche (SearchBar.tsx) est synchronisee avec les <code>searchParams</code> "
        "de l'URL pour permettre des liens partageables.",
        body
    ))

    ui_captures = [
        ("image (48).png", "7.1 Formulaire CRUD - Creation d'une demande",
         "Page \"Nouveau besoin\" avec les champs valides par Zod : titre, description, "
         "date souhaitee, lieu et categorie. Le bouton de soumission affiche un spinner "
         "pendant la creation."),
        ("Capture d’écran 2026-05-03 120707.png", "7.2 Formulaire CRUD - Edition (avec champs caches id + version)",
         "Page \"Modifier la demande\" avec le formulaire pre-rempli a partir des donnees "
         "existantes. Deux champs <code>&lt;input type=\"hidden\"&gt;</code> sont presents "
         "dans le DOM : <code>id</code> et <code>version</code> (verrou optimiste). Si la "
         "demande a ete modifiee entre temps par un autre utilisateur, l'<code>updateMany</code> "
         "echoue et un message de conflit est retourne."),
        ("image (49).png", "7.3 Liste paginee des demandes (avec SearchBar)",
         "Affichage des demandes urgentes, avec barre de recherche debouncee (300 ms) "
         "synchronisee avec les searchParams de l'URL. Le compteur de resultats et la "
         "pagination s'adaptent automatiquement aux filtres."),
        ("Capture d’écran 2026-05-03 101650.png", "7.4 Etat vide - Aucune demande trouvee",
         "Recherche avec un terme inexistant (<code>q=zzzzz</code>) : la liste affiche "
         "le message \"Aucune demande trouvee.\" et le compteur indique 0 resultat."),
        ("Capture d’écran 2026-05-03 105550.png", "7.5 Etat de chargement - Squelettes (loading.tsx)",
         "Squelette de la page panier (rectangles gris pulsants via <code>animate-pulse</code>) "
         "qui s'affiche pendant que <code>getCart()</code> charge les donnees. Implemente dans "
         "<code>src/app/cart/loading.tsx</code>. Un squelette equivalent existe pour la liste "
         "des demandes (<code>src/app/service-requests/loading.tsx</code>)."),
        ("Capture d’écran 2026-05-03 120722.png", "7.6 Confirmation de suppression",
         "Popup native du navigateur \"Voulez-vous vraiment supprimer cette demande ? Cette "
         "action est irreversible.\" avec boutons OK / Cancel. Implementee via "
         "<code>window.confirm()</code> dans le composant <code>DeleteRequestButton.tsx</code>. "
         "Si l'utilisateur confirme, l'action serveur <code>deleteRequestAction(id)</code> est "
         "appelee et l'utilisateur est redirige vers la liste."),
        ("image (47).png", "7.7 Panier - Vue principale (Epic C)",
         "Page /cart avec : badge \"1\" sur l'icone panier dans le header, carte "
         "decrivant l'offre ajoutee (titre de la demande, prestataire, description, prix), "
         "bouton Supprimer rouge, et resume des couts a droite (sous-total 95.00 $, frais "
         "plateforme 10% = 9.50 $, total 104.50 $). Boutons \"Confirmer et proceder au "
         "paiement\" et \"Vider le panier\"."),
    ]

    for filename, label, desc in ui_captures:
        story.append(Paragraph(label, h2))
        story.append(Paragraph(desc, body))
        story.append(shot(filename, max_w_cm=16.5, max_h_cm=12))
        story.append(Paragraph(f"Capture : {filename}", caption_style))
        story.append(PageBreak())


def section_bonus(story):
    story.append(Paragraph("8. Bonus - Pagination par curseur", h1))
    story.append(hr())
    story.append(Paragraph(
        "Le bonus retenu est l'implementation d'une <b>pagination par curseur</b> "
        "(cursor-based pagination) en plus de la pagination par offset deja en place. "
        "Les deux approches coexistent dans le projet et utilisent les memes filtres.",
        body
    ))

    story.append(Paragraph("8.1 Implementation", h2))
    story.append(Paragraph("&bull; Fonction getCursorPaginatedServiceRequests() ajoutee dans "
        "src/lib/requetes/serviceRequests.ts.", bullet))
    story.append(Paragraph("&bull; Page de demo dediee : src/app/service-requests/cursor/page.tsx.", bullet))
    story.append(Paragraph("&bull; URL : /service-requests/cursor?cursor=lastId&amp;q=...&amp;status=OPEN", bullet))
    story.append(Paragraph("&bull; Page existante /service-requests conservee en mode <b>offset</b>.", bullet))

    story.append(Paragraph("Extrait du code Prisma (curseur)", h3))
    story.append(Paragraph(
        "<font face='Courier' size='9'>"
        "const items = await prisma.serviceRequest.findMany({<br/>"
        "&nbsp;&nbsp;where,<br/>"
        "&nbsp;&nbsp;take: take + 1,&nbsp;&nbsp;// +1 pour detecter hasMore<br/>"
        "&nbsp;&nbsp;...(params.cursor ? {<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;cursor: { id: params.cursor },<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;skip: 1, // ne PAS reinclure l'item du curseur<br/>"
        "&nbsp;&nbsp;} : {}),<br/>"
        '&nbsp;&nbsp;orderBy: [{ createdAt: "desc" }, { id: "desc" }],<br/>'
        "&nbsp;&nbsp;include: { client: true, categories: ..., _count: ... },<br/>"
        "});</font>",
        code_style
    ))

    story.append(Paragraph(
        "<b>Astuce.</b> On demande take + 1 elements : si on en recoit take + 1, "
        "on sait qu'il existe une page suivante (hasMore = true) et le nextCursor "
        "est l'id du dernier element retourne. Le orderBy inclut un tie-breaker "
        "stable sur id pour eviter les sauts d'elements lors d'egalites sur createdAt.",
        body
    ))
    story.append(PageBreak())

    story.append(Paragraph("8.2 Comparaison Offset vs Curseur", h2))
    rows = [
        ["Critere", "Offset (skip / take)", "Curseur (cursor / take)"],
        ["Requete SQL generee", "OFFSET N LIMIT M", "WHERE id apres cursor + LIMIT M"],
        ["Performance gros volumes",
         "Degrade avec N (scan + rejet des N premieres lignes).",
         "Constante : utilise un index unique sur id."],
        ["Acces a une page N", "Direct (page=42).", "Impossible : navigation sequentielle uniquement."],
        ["Retour en arriere", "Trivial (page--).", "Possible mais demande une pile de curseurs cote client."],
        ["Insertion concurrente",
         "Risque de duplication ou saut d'elements.",
         "Robuste : un nouvel element n'affecte pas la suite."],
        ["Affichage du total", "Naturel (count() en parallele).", "Plus couteux : count() reste necessaire."],
        ["Implementation", "Simple : skip / take.", "Subtile : tie-breaker + take+1 + skip:1."],
        ["Cas d'usage", "Tableaux d'admin, navigation arbitraire.", "Feeds, scroll infini, gros volumes."],
    ]
    t = Table(rows, colWidths=[3.5 * cm, 6.0 * cm, 6.5 * cm])
    t.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8.5),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
        ("BACKGROUND", (0, 1), (0, -1), HexColor("#eff6ff")),
        ("BACKGROUND", (1, 1), (1, -1), HexColor("#fef3c7")),
        ("BACKGROUND", (2, 1), (2, -1), HexColor("#dcfce7")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOX", (0, 0), (-1, -1), 0.5, BORDER),
        ("INNERGRID", (0, 0), (-1, -1), 0.3, BORDER),
        ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
    ]))
    story.append(t)

    story.append(Paragraph("8.3 Conclusion", h2))
    story.append(Paragraph(
        "Pour SOS-BESOIN, la pagination par <b>offset</b> reste pertinente sur "
        "/service-requests car elle permet d'afficher un total et de sauter directement "
        "a une page donnee. La pagination par <b>curseur</b>, exposee sur "
        "/service-requests/cursor, devient le meilleur choix des que la liste depasse "
        "plusieurs milliers d'enregistrements ou pour un futur scroll infini.",
        body
    ))


def header_footer(canv, doc):
    canv.saveState()
    page_w, page_h = letter
    canv.setStrokeColor(BORDER)
    canv.setLineWidth(0.5)
    canv.line(2 * cm, page_h - 1.3 * cm, page_w - 2 * cm, page_h - 1.3 * cm)
    canv.setFont("Helvetica-Bold", 9)
    canv.setFillColor(PRIMARY)
    canv.drawString(2 * cm, page_h - 1.1 * cm, "SOS-BESOIN")
    canv.setFont("Helvetica", 8)
    canv.setFillColor(MUTED)
    canv.drawRightString(page_w - 2 * cm, page_h - 1.1 * cm,
                         "Lab 2 - Livrable 1 - Equipe SuperMoms")
    canv.setStrokeColor(BORDER)
    canv.line(2 * cm, 1.3 * cm, page_w - 2 * cm, 1.3 * cm)
    canv.setFont("Helvetica", 8)
    canv.setFillColor(MUTED)
    canv.drawString(2 * cm, 0.9 * cm, "420-951-MA - Hiver 2026")
    canv.drawRightString(page_w - 2 * cm, 0.9 * cm, f"Page {doc.page}")
    canv.restoreState()


def build():
    doc = SimpleDocTemplate(
        OUTPUT_PATH, pagesize=letter,
        leftMargin=2 * cm, rightMargin=2 * cm,
        topMargin=2 * cm, bottomMargin=2 * cm,
        title="Livrable 1 - Lab 2 - SOS-BESOIN",
        author="Equipe SuperMoms",
        subject="Lab 2 - Server Actions, API Routes & Panier",
    )
    story = []
    cover_page(story)
    toc(story)
    section_presentation(story)
    section_github(story)
    section_server_actions(story)
    section_api(story)
    section_postman(story)
    section_panier(story)
    section_ui(story)
    section_bonus(story)
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print(f"PDF genere : {OUTPUT_PATH}")


if __name__ == "__main__":
    build()
