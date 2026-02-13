# Build Your Own Bouquet

A full-stack Next.js web app that lets users create and send virtual bouquets. Pick flowers and props, arrange them on a canvas, and email your bouquet to someone special.

## Features

- **Bouquet builder**: Select from flowers and props (dynamically loaded from `public/assets/`)
- **Live preview**: Canvas-based bouquet preview with randomize and reset
- **Send by email**: Nodemailer sends the generated PNG with your message
- **Gemini enhancement**: Optional AI rewrite of your message (max 200 chars)
- **Rate limiting**: Max 5 sends per hour per IP
- **Pastel kawaii UI**: TailwindCSS, mobile responsive

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Process images (black → transparent)

If you have source images in Cursor assets, run:

```bash
npm run process-images
```

Or manually place PNG files in:

- `public/assets/flowers/` (e.g. `tulip.png`, `rose.png`)
- `public/assets/props/` (e.g. `teddy-bear.png`, `red-heart.png`)

Labels are derived from filenames (`tulip.png` → "Tulip", `teddy-bear.png` → "Teddy Bear").

### 3. Environment variables

Copy `.env.example` to `.env.local` and fill in:

```
GEMINI_API_KEY=      # Optional: for "Enhance with Gemini" feature
EMAIL_USER=          # SMTP user (e.g. Gmail address)
EMAIL_PASS=          # SMTP password (use App Password for Gmail)
```

For Gmail, enable 2FA and create an App Password at https://myaccount.google.com/apppasswords

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
/public
  /assets/flowers/   # Flower PNGs (transparent background)
  /assets/props/     # Prop PNGs
  /generated/        # Temporary bouquet outputs

/src
  /app
    page.tsx         # Landing
    /builder         # Bouquet builder
    /success         # Confirmation
    /api
      assets         # GET - list flowers/props
      enhance        # POST - Gemini message rewrite
      send           # POST - generate + email bouquet
  /components       # Navbar, CandyButton, AssetCard, etc.
  /lib
    validation.ts    # Zod schemas
    rate-limit.ts    # IP rate limiting
    canvas-utils.ts  # Bouquet layout algorithm
```

## Adding new assets

Drop new PNG files into `public/assets/flowers/` or `public/assets/props/`. The app loads them dynamically; no code changes needed.
