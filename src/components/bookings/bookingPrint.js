import moment from "moment";

function esc(s) {
    if (s == null) return "";
    return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function buildInvoiceHtml(booking) {
    const nights = moment(booking.checkOutDate).diff(moment(booking.checkInDate), "days");
    const price = Number(booking.room?.roomPrice ?? 0);
    const total = Math.max(0, nights) * price;
    const roomType = booking.room?.roomType ?? "—";
    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8"/>
  <title>Facture — ${esc(booking.bookingConfirmationCode)}</title>
  <style>
    body { font-family: Segoe UI, system-ui, sans-serif; padding: 32px; max-width: 640px; margin: 0 auto; color: #222; }
    h1 { font-size: 1.25rem; color: rgb(169, 77, 123); margin-bottom: 4px; }
    h2 { font-size: 1rem; font-weight: 600; margin: 24px 0 12px; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th, td { text-align: left; padding: 8px 0; border-bottom: 1px solid #eee; }
    .total { font-size: 1.1rem; font-weight: 700; margin-top: 16px; }
    .muted { color: #666; font-size: 13px; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <h1>SmartHotelPlus</h1>
  <p class="muted">Confirmation de réservation / facture estimative</p>
  <h2>Client</h2>
  <table>
    <tr><th>Nom</th><td>${esc(booking.guestFullName)}</td></tr>
    <tr><th>Email</th><td>${esc(booking.guestEmail)}</td></tr>
    <tr><th>Code de confirmation</th><td><strong>${esc(booking.bookingConfirmationCode)}</strong></td></tr>
  </table>
  <h2>Séjour</h2>
  <table>
    <tr><th>Chambre</th><td>${esc(roomType)}</td></tr>
    <tr><th>Arrivée</th><td>${esc(booking.checkInDate)}</td></tr>
    <tr><th>Départ</th><td>${esc(booking.checkOutDate)}</td></tr>
    <tr><th>Nuits</th><td>${nights}</td></tr>
    <tr><th>Personnes</th><td>${booking.totalNumOfGuest ?? "—"}</td></tr>
    <tr><th>Prix / nuit</th><td>${price.toFixed(2)} €</td></tr>
  </table>
  <p class="total">Total estimé : ${total.toFixed(2)} €</p>
  <p class="muted">Document généré le ${moment().format("DD/MM/YYYY HH:mm")} — montant indicatif selon tarif en vigueur.</p>
</body>
</html>`;
}

/** Ouvre une fenêtre d’impression avec une facture / confirmation de séjour. */
export function printBookingInvoice(booking) {
    const html = buildInvoiceHtml(booking);
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
    w.close();
}

/** Télécharge la facture au format HTML imprimable (utilisable en "Enregistrer en PDF"). */
export function downloadBookingInvoice(booking) {
    const html = buildInvoiceHtml(booking);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const code = booking?.bookingConfirmationCode || "reservation";
    const a = document.createElement("a");
    a.href = url;
    a.download = `facture-${code}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}
