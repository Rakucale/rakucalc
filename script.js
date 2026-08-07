const template = document.querySelector('#segment-template');
const segments = document.querySelector('#segments');
const yen = amount => `${Math.round(amount).toLocaleString('ja-JP')}円`;

function amount(card, name) {
  const input = card.querySelector(`[name="${name}"]`);
  const number = Number(input.value);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function recalculate() {
  let total = 0;
  [...segments.children].forEach((card, index) => {
    card.querySelector('.segment-number').textContent = `区間 ${index + 1}`;
    card.querySelector('.remove').hidden = segments.children.length === 1;
    const distance = amount(card, 'distance');
    const efficiency = amount(card, 'efficiency');
    const fuelPrice = amount(card, 'fuel-price');
    const fuel = distance && efficiency && fuelPrice ? distance / efficiency * fuelPrice : 0;
    const toll = amount(card, 'toll');
    const extras = amount(card, 'parking') + amount(card, 'other');
    const segmentCost = fuel + toll + extras;
    card.querySelector('.fuel-cost').textContent = yen(fuel);
    card.querySelector('.toll-cost').textContent = yen(toll);
    card.querySelector('.extra-cost').textContent = yen(extras);
    card.querySelector('.segment-cost').textContent = yen(segmentCost);
    total += segmentCost;
  });
  document.querySelector('#grand-total').textContent = yen(total);
  document.querySelector('#summary-total').textContent = yen(total);
  document.querySelector('#summary-count').textContent = `${segments.children.length}区間`;
}

function addSegment() {
  const fragment = template.content.cloneNode(true);
  const card = fragment.querySelector('.segment');
  card.addEventListener('input', recalculate);
  card.querySelector('.remove').addEventListener('click', () => { card.remove(); recalculate(); });
  card.querySelector('.map-search').addEventListener('click', () => {
    const origin = card.querySelector('[name="origin"]').value.trim();
    const waypoint = card.querySelector('[name="waypoint"]').value.trim();
    const destination = card.querySelector('[name="destination"]').value.trim();
    const message = card.querySelector('.route-message');
    if (!origin || !destination) { message.textContent = '出発地と目的地を入力してください。'; return; }
    const query = new URLSearchParams({ api: '1', origin, destination, travelmode: 'driving' });
    if (waypoint) query.set('waypoints', waypoint);
    window.open(`https://www.google.com/maps/dir/?${query.toString()}`, '_blank', 'noopener');
    message.textContent = '地図を別タブで開きました。距離を確認して入力してください。';
  });
  segments.appendChild(fragment);
  recalculate();
}

document.querySelector('#add-segment').addEventListener('click', addSegment);
document.querySelector('#copy-total').addEventListener('click', async () => {
  const text = `【ラク算｜交通費】\n${document.querySelector('#summary-count').textContent}の合計：${document.querySelector('#summary-total').textContent}`;
  try { await navigator.clipboard.writeText(text); document.querySelector('#copy-status').textContent = 'コピーしました。'; }
  catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const copied = document.execCommand('copy');
    area.remove();
    document.querySelector('#copy-status').textContent = copied ? 'コピーしました。' : 'コピーできませんでした。';
  }
});
document.querySelector('#year').textContent = new Date().getFullYear();
addSegment();
