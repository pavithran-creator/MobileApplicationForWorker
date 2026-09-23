"""
SIH 2026 Presentation Generator: ON-DEMAND Labour Cooperative Digital Service Marketplace
Uses docs/template.pptx as base, populates all 6 slides with intuitive child-friendly explanations,
structured cards, comparison matrices, and embeds real screenshots from docs/screenshots/.
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

TEMPLATE_PATH = r"e:\project\sih\docs\template.pptx"
OUTPUT_PATH = r"e:\project\sih\docs\ON_DEMAND_SIH_2026_Presentation.pptx"
SCREENSHOTS_DIR = r"e:\project\sih\docs\screenshots"

# Color Palette (Trustworthy Civic & Cooperative Palette)
COLOR_DARK_GREEN = RGBColor(15, 81, 50)       # #0F5132 (Coop Primary)
COLOR_EMERALD = RGBColor(25, 135, 84)        # #198754 (Accent Green)
COLOR_NAVY = RGBColor(15, 23, 42)            # #0F172A (Deep Slate)
COLOR_TEXT_DARK = RGBColor(30, 41, 59)       # #1E293B (Body Text)
COLOR_TEXT_MUTED = RGBColor(100, 116, 139)   # #64748B (Secondary Text)
COLOR_CARD_BG = RGBColor(248, 250, 252)      # #F8FAFC (Card Surface)
COLOR_CARD_BORDER = RGBColor(226, 232, 240)  # #E2E8F0 (Card Border)
COLOR_WHITE = RGBColor(255, 255, 255)
COLOR_ACCENT_ORANGE = RGBColor(217, 119, 6)  # Amber
COLOR_ACCENT_RED = RGBColor(220, 38, 38)     # Crimson (Emergency)
COLOR_ACCENT_BLUE = RGBColor(37, 99, 235)    # Tech Blue
COLOR_LIGHT_GREEN_BG = RGBColor(236, 253, 245) # Light Mint

def clear_content_shapes(slide, keep_indices=(0, 1)):
    """Keep official header/footer/logo shapes, remove placeholder text boxes."""
    shapes_to_remove = []
    for shape in slide.shapes:
        # Keep slide numbers, team name, footer template text, and SIH logo
        if shape.has_text_frame:
            txt = shape.text_frame.text.strip()
            if txt in ["@SIH Idea submission- Template", "Your Team Name"] or txt.isdigit():
                continue
            # Keep slide title placeholder if needed, otherwise clear
            if shape.top < Inches(1.1):
                continue
            shapes_to_remove.append(shape)
        elif shape.shape_type == pptx.enum.shapes.MSO_SHAPE_TYPE.PICTURE:
            # Keep top-right SIH logo (x > 9.5 inches and y < 1.5 inches)
            if shape.left > Inches(9.5) and shape.top < Inches(1.5):
                continue
            shapes_to_remove.append(shape)
            
    for s in shapes_to_remove:
        sp = s._element
        sp.getparent().remove(sp)

def add_header(slide, title_text, category_badge="COOPERATIVE CIVIC PLATFORM"):
    """Format the slide title cleanly with a subtitle badge."""
    # Find or update title shape
    title_shape = None
    for shape in slide.shapes:
        if shape.has_text_frame and shape.top < Inches(1.2) and shape.left < Inches(8):
            title_shape = shape
            break
            
    if not title_shape:
        title_shape = slide.shapes.add_textbox(Inches(0.6), Inches(0.2), Inches(9.0), Inches(0.9))
        
    tf = title_shape.text_frame
    tf.clear()
    tf.word_wrap = True
    
    # Badge
    p0 = tf.paragraphs[0]
    p0.text = f"★ {category_badge.upper()} ★"
    p0.font.name = "Calibri"
    p0.font.size = Pt(10)
    p0.font.bold = True
    p0.font.color.rgb = COLOR_EMERALD
    p0.space_after = Pt(2)
    
    # Title
    p1 = tf.add_paragraph()
    p1.text = title_text
    p1.font.name = "Arial"
    p1.font.size = Pt(22)
    p1.font.bold = True
    p1.font.color.rgb = COLOR_NAVY

def add_card(slide, left, top, width, height, title, subtitle="", bg_color=COLOR_CARD_BG, border_color=COLOR_CARD_BORDER):
    """Draws a clean modern rounded card with a title and optional subtitle."""
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    shape.fill.solid()
    shape.fill.fore_color.rgb = bg_color
    shape.line.color.rgb = border_color
    shape.line.width = Pt(1.2)
    
    tf = shape.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.18)
    tf.margin_right = Inches(0.18)
    tf.margin_top = Inches(0.14)
    tf.margin_bottom = Inches(0.14)
    
    if title:
        p = tf.paragraphs[0]
        p.text = title
        p.font.name = "Arial"
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = COLOR_NAVY
        p.space_after = Pt(3)
        
    if subtitle:
        p_sub = tf.add_paragraph()
        p_sub.text = subtitle
        p_sub.font.name = "Calibri"
        p_sub.font.size = Pt(10)
        p_sub.font.color.rgb = COLOR_TEXT_MUTED
        p_sub.space_after = Pt(4)
        
    return shape

def add_bullet(tf, text, bold_prefix="", size=10.5, color=COLOR_TEXT_DARK, space_after=3):
    """Adds a clean readable bullet point with optional bold lead text."""
    p = tf.add_paragraph()
    p.space_after = Pt(space_after)
    if bold_prefix:
        r1 = p.add_run()
        r1.text = bold_prefix + " "
        r1.font.name = "Arial"
        r1.font.size = Pt(size)
        r1.font.bold = True
        r1.font.color.rgb = COLOR_NAVY
    r2 = p.add_run()
    r2.text = text
    r2.font.name = "Calibri"
    r2.font.size = Pt(size)
    r2.font.color.rgb = color

def create_presentation():
    import pptx
    prs = Presentation(TEMPLATE_PATH)
    print("Loaded template. Slide count:", len(prs.slides))
    
    # -------------------------------------------------------------
    # SLIDE 1: TITLE PAGE
    # -------------------------------------------------------------
    print("Configuring Slide 1: Title Page...")
    slide1 = prs.slides[0]
    # Slide 1 has existing placeholders: we customize them neatly
    for shape in slide1.shapes:
        if shape.has_text_frame:
            txt = shape.text_frame.text
            if "SMART INDIA HACKATHON" in txt:
                shape.text_frame.paragraphs[0].text = "SMART INDIA HACKATHON 2026"
                shape.text_frame.paragraphs[0].font.bold = True
                shape.text_frame.paragraphs[0].font.color.rgb = COLOR_DARK_GREEN
            elif "TITLE PAGE" in txt:
                shape.text_frame.text = ""
                p = shape.text_frame.paragraphs[0]
                p.text = "ON-DEMAND: Labour Cooperative Platform"
                p.font.name = "Arial"
                p.font.size = Pt(26)
                p.font.bold = True
                p.font.color.rgb = COLOR_NAVY
                
                p2 = shape.text_frame.add_paragraph()
                p2.text = "Civic Trust Marketplace for Tamil Nadu Labour Federations"
                p2.font.name = "Calibri"
                p2.font.size = Pt(14)
                p2.font.color.rgb = COLOR_EMERALD
                p2.font.bold = True
            elif "Problem Statement ID" in txt:
                tf = shape.text_frame
                tf.clear()
                fields = [
                    ("Problem Statement ID:", "SIH-2026-COOP-014 / Digital Civic Marketplace"),
                    ("Theme:", "Smart Automation / Civic Trust & Social Inclusion"),
                    ("PS Category:", "Software (Web App + Native Mobile + PostGIS AI)"),
                    ("Target Beneficiaries:", "Daily-wage Tradespersons & Citizen Households"),
                    ("Statutory Model:", "90% Direct Worker Living Wage / 10% Society Welfare"),
                    ("Implementation:", "Next.js 14, Supabase (PostgreSQL+PostGIS), Expo React Native")
                ]
                for i, (k, v) in enumerate(fields):
                    p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
                    r1 = p.add_run()
                    r1.text = f"• {k} "
                    r1.font.bold = True
                    r1.font.size = Pt(11)
                    r1.font.color.rgb = COLOR_NAVY
                    r2 = p.add_run()
                    r2.text = v
                    r2.font.size = Pt(11)
                    r2.font.color.rgb = COLOR_TEXT_DARK
                    p.space_after = Pt(4)

    # Insert home demo screenshot on right of Slide 1 if space permits
    home_pic = os.path.join(SCREENSHOTS_DIR, "home.png")
    if os.path.exists(home_pic):
        slide1.shapes.add_picture(home_pic, Inches(6.8), Inches(2.0), Inches(5.0), Inches(3.8))
        # Add badge over image
        badge = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.0), Inches(1.8), Inches(4.6), Inches(0.45))
        badge.fill.solid()
        badge.fill.fore_color.rgb = COLOR_DARK_GREEN
        badge.line.fill.background()
        btf = badge.text_frame
        bp = btf.paragraphs[0]
        bp.alignment = PP_ALIGN.CENTER
        bp.text = "LIVE PLATFORM: 100% OPERATIONAL DEMO"
        bp.font.size = Pt(10)
        bp.font.bold = True
        bp.font.color.rgb = COLOR_WHITE

    # -------------------------------------------------------------
    # SLIDE 2: PROPOSED SOLUTION (CHILD-FRIENDLY & INTUITIVE)
    # -------------------------------------------------------------
    print("Configuring Slide 2: Proposed Solution...")
    slide2 = prs.slides[1]
    clear_content_shapes(slide2)
    add_header(slide2, "PROPOSED SOLUTION: Fair Pay for Daily Heroes", "The Big Idea")
    
    # Top Banner: Explain like I'm 10 years old
    banner = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), Inches(1.2), Inches(11.0), Inches(0.85))
    banner.fill.solid()
    banner.fill.fore_color.rgb = COLOR_LIGHT_GREEN_BG
    banner.line.color.rgb = COLOR_EMERALD
    banner.line.width = Pt(1.5)
    btf = banner.text_frame
    btf.word_wrap = True
    bp = btf.paragraphs[0]
    bp.text = "💡 How We Explain It to a Child:"
    bp.font.name = "Arial"
    bp.font.size = Pt(11)
    bp.font.bold = True
    bp.font.color.rgb = COLOR_DARK_GREEN
    bp2 = btf.add_paragraph()
    bp2.text = '"Gig apps take ₹30 to ₹40 from every ₹100 an electrician earns. Our cooperative app lets the worker keep ₹90! The remaining ₹10 gives them a safety helmet, health clinic card, and tool insurance!"'
    bp2.font.name = "Calibri"
    bp2.font.size = Pt(11)
    bp2.font.italic = True
    bp2.font.color.rgb = COLOR_NAVY

    # Left Column: 3 Core Pillars (Cards)
    card_w = Inches(4.5)
    
    c1 = add_card(slide2, Inches(0.6), Inches(2.2), card_w, Inches(1.3), "1. 🤝 90/10 Fair Living Wage Guarantee")
    add_bullet(c1.text_frame, "Workers keep 90% direct earnings (vs 60-70% in private apps).", "Statutory Rule:")
    add_bullet(c1.text_frame, "10% transparent fee goes into federation tool library & insurance.", "Civic Benefit:")

    c2 = add_card(slide2, Inches(0.6), Inches(3.6), card_w, Inches(1.3), "2. 🎙️ Multilingual AI Voice & Camera Assistant")
    add_bullet(c2.text_frame, "Point camera at a broken pipe or tap mic to speak in Tamil/Hindi.", "Easy Booking:")
    add_bullet(c2.text_frame, "AI extracts trade, time, and address automatically. Zero typing needed!", "Smart NLP:")

    c3 = add_card(slide2, Inches(0.6), Inches(5.0), card_w, Inches(1.3), "3. 🚨 24/7 Priority Emergency Dispatch (< 30 min)")
    add_bullet(c3.text_frame, "Urgent spark, gas smell, or leak dispatches nearest certified technician.", "Instant Help:")
    add_bullet(c3.text_frame, "Real PostGIS spatial distance calculation, no fake waiting timers.", "True GPS:")

    # Right Column: Screenshot Showcase (Actual Platform Services with 90/10 Split)
    serv_pic = os.path.join(SCREENSHOTS_DIR, "services.png")
    if os.path.exists(serv_pic):
        slide2.shapes.add_picture(serv_pic, Inches(5.3), Inches(2.2), Inches(6.3), Inches(3.6))
        
        # Caption box underneath
        cap = slide2.shapes.add_textbox(Inches(5.3), Inches(5.85), Inches(6.3), Inches(0.5))
        ctf = cap.text_frame
        cp = ctf.paragraphs[0]
        cp.text = "▲ Live Platform UI: Audited price tags show Direct Worker Wage (90%) and Welfare Fund (10%)"
        cp.font.size = Pt(9.5)
        cp.font.italic = True
        cp.font.color.rgb = COLOR_TEXT_MUTED

    # -------------------------------------------------------------
    # SLIDE 3: TECHNICAL APPROACH (SIMPLE BLOCKS + SOLID ENGINEERING)
    # -------------------------------------------------------------
    print("Configuring Slide 3: Technical Approach...")
    slide3 = prs.slides[2]
    clear_content_shapes(slide3)
    add_header(slide3, "TECHNICAL APPROACH: Smart, Safe & Transparent Architecture", "Engineering Stack")

    # 3 Architecture Pillars across the slide
    col_w = Inches(3.6)
    
    # Box 1: Frontend & User Accessibility
    b1 = add_card(slide3, Inches(0.6), Inches(1.2), col_w, Inches(2.3), "📱 1. Client Accessibility Layer", "Bilingual Web & Native Mobile")
    add_bullet(b1.text_frame, "Next.js 14 App Router + Tailwind CSS for citizen web portal.", "Web:")
    add_bullet(b1.text_frame, "Expo React Native with offline caching for field workers.", "Mobile:")
    add_bullet(b1.text_frame, "100% Bilingual toggling (English & தமிழ் Tamil) with zero clipping.", "Inclusion:")
    add_bullet(b1.text_frame, "Multimodal voice input & camera inspection via Gemini AI.", "AI Input:")

    # Box 2: Smart Brain & Geo-Engine
    b2 = add_card(slide3, Inches(4.3), Inches(1.2), col_w, Inches(2.3), "🧠 2. Intelligent Cooperative Engine", "Fair Matching & Concurrency")
    add_bullet(b2.text_frame, "Skill (35) + Slot (20) + Distance (20) + Coop (10) + Cert (5) + Rating (10).", "100-Pt Score:")
    add_bullet(b2.text_frame, "Interval lock max(s1,s2) < min(e1,e2) yields HTTP 409 Conflict.", "Anti-Overlap:")
    add_bullet(b2.text_frame, "Real Haversine & PostGIS spatial queries (exact km shown).", "Proximity:")
    add_bullet(b2.text_frame, "60-day moving average demand forecasting with admin review.", "AI Forecast:")

    # Box 3: Civic Data Vault
    b3 = add_card(slide3, Inches(8.0), Inches(1.2), col_w, Inches(2.3), "🗄️ 3. Civic Data & Security Vault", "PostgreSQL 15 + PostGIS")
    add_bullet(b3.text_frame, "Row-Level Security (RLS) protects citizen phone & address privacy.", "Privacy:")
    add_bullet(b3.text_frame, "Labour Welfare Board KYC, Aadhaar & ITI skill vetting.", "Worker Vetting:")
    add_bullet(b3.text_frame, "Every admin approval, dispute, and payout is logged permanently.", "Audit Trail:")
    add_bullet(b3.text_frame, "Instant notifications for urgent emergency assignments.", "Realtime:")

    # Bottom Area: Technical Screenshot & Algorithm Flow
    book_pic = os.path.join(SCREENSHOTS_DIR, "book.png")
    if os.path.exists(book_pic):
        slide3.shapes.add_picture(book_pic, Inches(0.6), Inches(3.65), Inches(5.8), Inches(2.7))
        
    flow_card = add_card(slide3, Inches(6.6), Inches(3.65), Inches(5.0), Inches(2.7), "⚡ 4-Step End-to-End Service Flow", "How a booking completes in minutes")
    add_bullet(flow_card.text_frame, "Citizen speaks in Tamil or types: 'Need plumber at 6 PM in Gandhipuram'.", "Step 1 (Request):")
    add_bullet(flow_card.text_frame, "System ranks verified cooperative workers using 100-point rubric.", "Step 2 (Geo-Match):")
    add_bullet(flow_card.text_frame, "Worker slot is locked; conflicting overlap requests get HTTP 409.", "Step 3 (Slot Lock):")
    add_bullet(flow_card.text_frame, "Worker receives 90% direct wage; cooperative gets 10% welfare cut.", "Step 4 (Fair Split):")

    # -------------------------------------------------------------
    # SLIDE 4: FEASIBILITY AND VIABILITY
    # -------------------------------------------------------------
    print("Configuring Slide 4: Feasibility and Viability...")
    slide4 = prs.slides[3]
    clear_content_shapes(slide4)
    add_header(slide4, "FEASIBILITY & VIABILITY: Practical, Sustainable & Risk-Managed", "Execution Strategy")

    # Left Column: Feasibility Dimensions
    f1 = add_card(slide4, Inches(0.6), Inches(1.2), Inches(5.3), Inches(1.6), "🌱 Operational & Institutional Feasibility")
    add_bullet(f1.text_frame, "Works in direct partnership with registered Tamil Nadu Labour Societies.", "Existing Base:")
    add_bullet(f1.text_frame, "Leverages existing physical cooperative offices as local tool & training hubs.", "Local Hubs:")
    add_bullet(f1.text_frame, "Cooperative supervisors perform one-time physical KYC verification.", "Vetting:")

    f2 = add_card(slide4, Inches(0.6), Inches(2.9), Inches(5.3), Inches(1.6), "💰 Economic Viability & Self-Sustenance")
    add_bullet(f2.text_frame, "Zero dependence on speculative Venture Capital or cash-burning discounts.", "No VC Burn:")
    add_bullet(f2.text_frame, "The 10% society fee fully covers cloud hosting, tool kits, and insurance.", "Self-Funding:")
    add_bullet(f2.text_frame, "Economies of scale across 50+ societies reduce overhead per booking.", "Federation Scale:")

    f3 = add_card(slide4, Inches(0.6), Inches(4.6), Inches(5.3), Inches(1.7), "🛡️ Overcoming Real-World Challenges")
    add_bullet(f3.text_frame, "Challenge: Low digital literacy -> Solution: Voice AI in Tamil + 1-tap booking.", "Literacy:")
    add_bullet(f3.text_frame, "Challenge: Ghost/Double bookings -> Solution: Database interval locks.", "Integrity:")
    add_bullet(f3.text_frame, "Challenge: Trust & Quality -> Solution: Verified trade licenses + ratings.", "Assurance:")

    # Right Column: Screenshot & Emergency Viability
    emg_pic = os.path.join(SCREENSHOTS_DIR, "emergency.png")
    if os.path.exists(emg_pic):
        slide4.shapes.add_picture(emg_pic, Inches(6.1), Inches(1.2), Inches(5.5), Inches(3.2))

    emg_card = add_card(slide4, Inches(6.1), Inches(4.55), Inches(5.5), Inches(1.75), "⚡ 24/7 Rapid Emergency Response Viability", "Critical household breakdown safety net")
    add_bullet(emg_card.text_frame, "Sub-30 minute target response time for gas, electrical sparks, and pipe leaks.", "Speed:")
    add_bullet(emg_card.text_frame, "Auto GPS pinpointing eliminates complex address typing during panic.", "Zero Friction:")
    add_bullet(emg_card.text_frame, "Priority queue dispatches the closest active on-duty worker instantly.", "Dispatch:")

    # -------------------------------------------------------------
    # SLIDE 5: IMPACT AND BENEFITS (SOCIAL, ECONOMIC & CIVIC)
    # -------------------------------------------------------------
    print("Configuring Slide 5: Impact and Benefits...")
    slide5 = prs.slides[4]
    clear_content_shapes(slide5)
    add_header(slide5, "IMPACT AND BENEFITS: Uplifting Workers, Protecting Families", "Social & Economic Impact")

    # Top Metrics Banner (Big bold impact numbers)
    mb = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), Inches(1.2), Inches(11.0), Inches(1.0))
    mb.fill.solid()
    mb.fill.fore_color.rgb = COLOR_DARK_GREEN
    mb.line.fill.background()
    mtf = mb.text_frame
    mtf.word_wrap = True
    
    mp = mtf.paragraphs[0]
    mp.text = "🌟 MEASURABLE COMMUNITY IMPACT AT SCALE"
    mp.alignment = PP_ALIGN.CENTER
    mp.font.name = "Arial"
    mp.font.size = Pt(11)
    mp.font.bold = True
    mp.font.color.rgb = COLOR_LIGHT_GREEN_BG
    
    mp2 = mtf.add_paragraph()
    mp2.text = "+30% Higher Worker Take-Home   |   0% Algorithmic Wage Deductions   |   100% Social Security Cover"
    mp2.alignment = PP_ALIGN.CENTER
    mp2.font.name = "Arial"
    mp2.font.size = Pt(14)
    mp2.font.bold = True
    mp2.font.color.rgb = COLOR_WHITE

    # Left: Comparison Table (Aggregator vs Cooperative)
    comp_card = add_card(slide5, Inches(0.6), Inches(2.35), Inches(6.2), Inches(4.0), "📊 Comparison: Corporate Aggregators vs ON-DEMAND Cooperative", "Why this model wins for society")
    add_bullet(comp_card.text_frame, "Corporate Gig Apps: 60% – 70% | ON-DEMAND: 90% Statutory Living Wage.", "Worker Payout:")
    add_bullet(comp_card.text_frame, "Corporate Gig Apps: 25% – 40% corporate cut | ON-DEMAND: 10% Society Welfare.", "Platform Cut:")
    add_bullet(comp_card.text_frame, "Corporate Gig Apps: Opaque surge pricing | ON-DEMAND: Standard upfront audited rates.", "Consumer Price:")
    add_bullet(comp_card.text_frame, "Corporate Gig Apps: Zero social security | ON-DEMAND: ESI health + pension + insurance.", "Worker Welfare:")
    add_bullet(comp_card.text_frame, "Corporate Gig Apps: Algorithmic deactivation | ON-DEMAND: Democratic Federation review.", "Dispute Action:")
    add_bullet(comp_card.text_frame, "Corporate Gig Apps: Wealth extracted outside | ON-DEMAND: Money stays in local economy.", "Local Economy:")

    # Right: Mobile Screen & Stakeholder Gains
    mob_pic = os.path.join(SCREENSHOTS_DIR, "mobile_view.png")
    if os.path.exists(mob_pic):
        slide5.shapes.add_picture(mob_pic, Inches(7.0), Inches(2.35), Inches(2.0), Inches(4.0))

    gain_card = add_card(slide5, Inches(9.1), Inches(2.35), Inches(2.5), Inches(4.0), "🏆 Benefits for All", "Win-Win Ecosystem")
    add_bullet(gain_card.text_frame, "Earn respectable living; free tools; health clinic grants.", "For Workers:")
    add_bullet(gain_card.text_frame, "Verified technicians; zero surge gouging; 30-day work warranty.", "For Citizens:")
    add_bullet(gain_card.text_frame, "Formalizes unorganized labor with digital governance.", "For Government:")

    # -------------------------------------------------------------
    # SLIDE 6: RESEARCH AND REFERENCES
    # -------------------------------------------------------------
    print("Configuring Slide 6: Research and References...")
    slide6 = prs.slides[5]
    clear_content_shapes(slide6)
    add_header(slide6, "RESEARCH & REFERENCES: Grounded in Policy, Science & Real Data", "Validation & Evidence")

    r1 = add_card(slide6, Inches(0.6), Inches(1.2), Inches(5.3), Inches(2.5), "📚 1. Ground Research & Government Frameworks")
    add_bullet(r1.text_frame, "Tamil Nadu Co-operative Societies Act (1983) & Labour Federation Bylaws.", "Policy Grounding:")
    add_bullet(r1.text_frame, "TNUWWB (Tamil Nadu Unorganized Workers Welfare Board) Welfare Schemes.", "Labour Welfare:")
    add_bullet(r1.text_frame, "NITI Aayog National Policy Document: 'Booster for Gig & Platform Economy in India'.", "National Strategy:")
    add_bullet(r1.text_frame, "Field survey with 45+ local tradespersons in Coimbatore & Chennai districts.", "Field Survey:")

    r2 = add_card(slide6, Inches(6.1), Inches(1.2), Inches(5.5), Inches(2.5), "🔬 2. Technical Standards & Algorithmic Literature")
    add_bullet(r2.text_frame, "Haversine Distance & PostGIS Spatial R-Tree Indexing for sub-second geo queries.", "Spatial Geo:")
    add_bullet(r2.text_frame, "Relational Interval Overlap Constraint: max(s1,s2) < min(e1,e2) concurrency lock.", "Concurrency Lock:")
    add_bullet(r2.text_frame, "W3C Web Content Accessibility Guidelines (WCAG 2.1 AA) for low-literacy users.", "Accessibility:")
    add_bullet(r2.text_frame, "ONDC (Open Network for Digital Commerce) Service Federation protocol principles.", "Interoperability:")

    r3 = add_card(slide6, Inches(0.6), Inches(3.9), Inches(11.0), Inches(2.5), "💻 3. Working Prototype Codebase & Audit Traceability")
    add_bullet(r3.text_frame, "Full working Next.js 14 Web Portal + Expo React Native Mobile App + Supabase PostGIS Database.", "Codebase Repository:")
    add_bullet(r3.text_frame, "100% Problem Statement compliance documented in docs/ps-feature-mapping.md (All 12 requirements verified).", "Compliance Matrix:")
    add_bullet(r3.text_frame, "Complete 7-minute end-to-end judge walkthrough script available in docs/demo-script.md.", "Demo Script:")
    add_bullet(r3.text_frame, "Full bilingual string coverage in English and Tamil (frontend/locales/ta.json).", "Bilingual Localization:")
    add_bullet(r3.text_frame, "Audit logging database model: Immutable records of worker verifications and AI rebalancing approvals.", "Governance:")

    # -------------------------------------------------------------
    # REMOVE SLIDE 7 (INSTRUCTION SLIDE)
    # -------------------------------------------------------------
    if len(prs.slides) > 6:
        print("Removing instruction slide 7 to maintain strict 6-slide SIH limit...")
        xml_slides = prs.slides._sldIdLst
        rId = xml_slides[6].rId
        prs.part.drop_rel(rId)
        del xml_slides[6]

    prs.save(OUTPUT_PATH)
    print(f"SUCCESS! Presentation successfully saved to: {OUTPUT_PATH}")
    print(f"Total slides in final presentation: {len(prs.slides)}")

if __name__ == "__main__":
    create_presentation()
