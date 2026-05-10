import { ImageResponse } from 'next/og';
import { findGuestByUniqueCode } from '@/lib/airtable';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

function safe(s: string): string {
  return (s ?? '').replace(/[^\x20-\x7E]/g, '').trim();
}

// Load fonts from the already-installed @fontsource packages on disk
// This avoids any network calls that can timeout on Vercel
function loadFont(relativePath: string): ArrayBuffer | null {
  try {
    const full = path.join(process.cwd(), 'node_modules', relativePath);
    return fs.readFileSync(full).buffer as ArrayBuffer;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body        = await req.json();
    const code        = String(body.code ?? '').trim();
    const imageBase64 = (body.imageBase64 as string) || null;

    if (!code) return Response.json({ error: 'Code required' }, { status: 400 });

    const guest = await findGuestByUniqueCode(code);
    if (!guest) return Response.json({ error: 'Guest not found' }, { status: 404 });

    const qrDataUrl = await QRCode.toDataURL(code, {
      margin: 2, width: 220,
      color: { dark: '#0A2810', light: '#F8F4E3' },
    });

    // Load fonts from disk (already installed deps — no network needed)
    const fontBold    = loadFont('@fontsource/cormorant-garamond/files/cormorant-garamond-latin-700-normal.woff2');
    const fontRegular = loadFont('@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-normal.woff2');

    const title = safe(process.env.NEXT_PUBLIC_WEDDING_TITLE  ?? 'Gabby & Esther');
    const date  = safe(process.env.NEXT_PUBLIC_WEDDING_DATE   ?? 'Saturday, 14th December 2024');
    const venue = safe(process.env.NEXT_PUBLIC_WEDDING_VENUE  ?? 'The Grand Ballroom, Eko Hotel & Suites');
    const time  = safe(process.env.NEXT_PUBLIC_WEDDING_TIME   ?? '12:00 PM');
    const name  = safe(guest.Name);
    const seat  = safe(String(guest.Seat_Number ?? 'TBA'));
    const ucode = safe(guest.Unique_Code ?? code);
    const tag   = '#' + safe(title.replace(/\s*&\s*/g, 'And').replace(/\s/g, '')) + '2024';

    const BG     = '#F8F4E3';
    const GREEN  = '#0A2810';
    const GOLD   = '#B8860B';
    const GOLDLT = '#D4A843';
    const GOLDPL = '#F0DFA0';
    const INK    = '#1A1208';
    const INKLT  = '#4A3D2A';
    const W = 800, H = 1150;

    type Wt = 100|200|300|400|500|600|700|800|900;
    const fonts: { name: string; data: ArrayBuffer; weight: Wt; style: 'normal' }[] = [];
    if (fontBold    && fontBold.byteLength    > 0) fonts.push({ name: 'Serif', data: fontBold,    weight: 700, style: 'normal' });
    if (fontRegular && fontRegular.byteLength > 0) fonts.push({ name: 'Serif', data: fontRegular, weight: 400, style: 'normal' });
    const ff = fonts.length > 0 ? 'Serif' : 'Georgia, serif';

    return new ImageResponse(
      (
        <div style={{ display: 'flex', width: W, height: H, background: BG, position: 'relative', fontFamily: ff }}>

          {/* Borders */}
          <div style={{ position: 'absolute', top: 10, left: 10, right: 10, bottom: 10, border: `3px solid ${GREEN}`, display: 'flex' }} />
          <div style={{ position: 'absolute', top: 20, left: 20, right: 20, bottom: 20, border: `1px solid ${GOLD}`, display: 'flex' }} />

          {/* Corner diamonds */}
          <div style={{ position: 'absolute', top: 7,  left: 7,  width: 10, height: 10, background: GOLD, transform: 'rotate(45deg)', display: 'flex' }} />
          <div style={{ position: 'absolute', top: 7,  right: 7, width: 10, height: 10, background: GOLD, transform: 'rotate(45deg)', display: 'flex' }} />
          <div style={{ position: 'absolute', bottom: 7, left: 7,  width: 10, height: 10, background: GOLD, transform: 'rotate(45deg)', display: 'flex' }} />
          <div style={{ position: 'absolute', bottom: 7, right: 7, width: 10, height: 10, background: GOLD, transform: 'rotate(45deg)', display: 'flex' }} />

          {/* Content */}
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', padding: '36px 44px 28px' }}>

            {/* Header */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: 10, letterSpacing: 8, color: GOLDLT, fontWeight: 700, marginBottom: 6 }}>WEDDING  INVITATION</div>
              <div style={{ fontSize: 68, color: '#7A5C00', fontWeight: 700, lineHeight: 1.1, marginBottom: 6 }}>{title}</div>
              <div style={{ width: 500, height: 1, background: GOLD, marginBottom: 8 }} />
              <div style={{ fontSize: 13, color: INKLT, marginBottom: 4 }}>Together with their families, request the pleasure of your company</div>
            </div>

            {/* Event bar */}
            <div style={{ display: 'flex', marginTop: 18, border: `1px solid ${GOLD}`, background: '#F0E8C8' }}>
              <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', padding: '14px 8px' }}>
                <div style={{ fontSize: 9, letterSpacing: 4, fontWeight: 700, color: GOLDLT, marginBottom: 6 }}>DATE</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: INK, textAlign: 'center' }}>{date}</div>
              </div>
              <div style={{ width: 1, background: GOLDLT }} />
              <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', padding: '14px 8px' }}>
                <div style={{ fontSize: 9, letterSpacing: 4, fontWeight: 700, color: GOLDLT, marginBottom: 6 }}>TIME</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: INK }}>{time}</div>
              </div>
              <div style={{ width: 1, background: GOLDLT }} />
              <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', padding: '14px 8px' }}>
                <div style={{ fontSize: 9, letterSpacing: 4, fontWeight: 700, color: GOLDLT, marginBottom: 6 }}>VENUE</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: INK, textAlign: 'center' }}>{venue}</div>
              </div>
            </div>

            {/* RSVP label */}
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 16, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: GOLD }} />
              <div style={{ fontSize: 11, letterSpacing: 6, fontWeight: 700, color: GOLDLT, marginLeft: 14, marginRight: 14 }}>RSVP ADMISSION CARD</div>
              <div style={{ flex: 1, height: 1, background: GOLD }} />
            </div>

            {/* Body: photo + details */}
            <div style={{ display: 'flex', gap: 24, flex: 1 }}>

              {/* Photo */}
              <div style={{ display: 'flex', flexDirection: 'column', width: 250 }}>
                {imageBase64 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', width: 250 }}>
                    <div style={{ background: GREEN, padding: 6, display: 'flex' }}>
                      <div style={{ border: `2px solid ${GOLD}`, padding: 3, display: 'flex', background: 'white' }}>
                        <img src={imageBase64} width={224} height={272} alt="guest" />
                      </div>
                    </div>
                    <div style={{ background: GREEN, display: 'flex', justifyContent: 'center', padding: '6px 0' }}>
                      <div style={{ fontSize: 8, letterSpacing: 6, fontWeight: 700, color: GOLDPL }}>G U E S T</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ width: 250, height: 300, background: '#E8E0C8', border: `4px solid ${GREEN}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: 12, color: INKLT }}>No Photo</div>
                  </div>
                )}
              </div>

              {/* Details */}
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: 9, letterSpacing: 4, fontWeight: 700, color: GOLDLT, marginBottom: 4 }}>GUEST NAME</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: INK }}>{name}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: 9, letterSpacing: 4, fontWeight: 700, color: GOLDLT, marginBottom: 4 }}>SEAT NUMBER</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: INK }}>{seat}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: 9, letterSpacing: 4, fontWeight: 700, color: GOLDLT, marginBottom: 6 }}>UNIQUE CODE</div>
                  <div style={{ background: GREEN, border: `1px solid ${GOLD}`, padding: '6px 14px', display: 'flex', width: 170 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: GOLDPL, letterSpacing: 2 }}>{ucode}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', marginTop: 6 }}>
                  <div style={{ background: GREEN, padding: 4, display: 'flex', width: 146 }}>
                    <div style={{ border: `2px solid ${GOLD}`, display: 'flex', background: '#F5F0E0' }}>
                      <img src={qrDataUrl} width={130} height={130} alt="qr" />
                    </div>
                  </div>
                  <div style={{ fontSize: 8, letterSpacing: 4, fontWeight: 700, color: INKLT, marginTop: 6 }}>SCAN TO VERIFY</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: 10 }}>
                <div style={{ flex: 1, height: 1, background: GOLD }} />
                <div style={{ width: 6, height: 6, background: GOLD, transform: 'rotate(45deg)', display: 'flex', marginLeft: 10, marginRight: 10 }} />
                <div style={{ flex: 1, height: 1, background: GOLD }} />
              </div>
              <div style={{ fontSize: 9, letterSpacing: 5, fontWeight: 700, color: GOLDLT, marginBottom: 4 }}>DRESS CODE</div>
              <div style={{ fontSize: 15, color: INK, marginBottom: 10 }}>Black Tie / Formal Attire</div>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: 10 }}>
                <div style={{ flex: 1, height: 1, background: GOLD }} />
                <div style={{ width: 6, height: 6, background: GOLD, transform: 'rotate(45deg)', display: 'flex', marginLeft: 10, marginRight: 10 }} />
                <div style={{ flex: 1, height: 1, background: GOLD }} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: INKLT }}>{tag}</div>
              <div style={{ fontSize: 10, color: INKLT, marginTop: 4 }}>Please present this card at the entrance for admission</div>
            </div>

          </div>
        </div>
      ),
      {
        width: W,
        height: H,
        fonts: fonts.length > 0 ? fonts : undefined,
      }
    );
  } catch (err) {
    console.error('/api/generate-card error:', err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}