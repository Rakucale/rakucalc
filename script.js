const yen = value => `${Math.round(value).toLocaleString('ja-JP')}円`;
const value = (form, name) => Number(form.elements[name].value);

function fail(form, message) {
  form.querySelector('.error').textContent = message;
  form.querySelector('.result').hidden = true;
}

function success(form, amount, label, sub = '') {
  form.querySelector('.error').textContent = '';
  const result = form.querySelector('.result');
  result.querySelector('strong').textContent = yen(amount);
  result.querySelector('.sub-result')?.replaceChildren(sub);
  result.dataset.copyText = `【ラク算】${label}：${yen(amount)}${sub ? `（${sub}）` : ''}`;
  result.hidden = false;
  result.querySelector('.copy-status').textContent = '';
}

document.querySelectorAll('form[data-calculator]').forEach(form => {
  form.addEventListener('submit', event => {
    event.preventDefault();
    const type = form.dataset.calculator;

    if (type === 'total') {
      const numbers = ['gas', 'highway', 'parking', 'other'].map(name => value(form, name) || 0);
      if (numbers.some(number => number < 0)) return fail(form, '0以上の金額を入力してください。');
      if (numbers.every(number => number === 0)) return fail(form, '費用を1つ以上入力してください。');
      return success(form, numbers.reduce((sum, number) => sum + number, 0), '車の交通費');
    }

    if (type === 'gas') {
      const distance = value(form, 'distance');
      const efficiency = value(form, 'efficiency');
      const price = value(form, 'price');
      const trip = value(form, 'trip');
      if (distance <= 0 || efficiency <= 0 || price <= 0) return fail(form, '距離・燃費・ガソリン価格を入力してください。');
      return success(form, distance * trip / efficiency * price, 'ガソリン代');
    }

    if (type === 'highway') {
      const fee = value(form, 'fee');
      const trip = value(form, 'trip');
      if (fee < 0 || form.elements.fee.value === '') return fail(form, '片道の高速代を入力してください。');
      return success(form, fee * trip, '高速代の合計');
    }

    if (type === 'parking') {
      const fee = value(form, 'fee');
      const unit = value(form, 'unit');
      const hours = value(form, 'hours');
      const minutes = value(form, 'minutes');
      if (fee < 0 || unit <= 0 || hours < 0 || minutes < 0 || minutes > 59 || [fee, unit, hours, minutes].some(Number.isNaN)) return fail(form, '料金・単位時間・利用時間を正しく入力してください。');
      if (hours === 0 && minutes === 0) return fail(form, '利用時間を入力してください。');
      return success(form, Math.ceil((hours * 60 + minutes) / unit) * fee, '駐車場代');
    }

    if (type === 'split') {
      const amount = value(form, 'amount');
      const people = value(form, 'people');
      if (amount < 0 || form.elements.amount.value === '' || !Number.isInteger(people) || people < 1 || people > 100) return fail(form, '合計金額と1〜100人の人数を入力してください。');
      return success(form, amount / people, '1人あたり', `${people}人で割り勘`);
    }
  });
});

document.querySelectorAll('.copy').forEach(button => {
  button.addEventListener('click', async () => {
    const result = button.closest('.result');
    try {
      await navigator.clipboard.writeText(result.dataset.copyText);
      result.querySelector('.copy-status').textContent = 'コピーしました。';
    } catch {
      const area = document.createElement('textarea');
      area.value = result.dataset.copyText;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const copied = document.execCommand('copy');
      area.remove();
      result.querySelector('.copy-status').textContent = copied ? 'コピーしました。' : 'コピーできませんでした。';
    }
  });
});

document.querySelector('#year').textContent = new Date().getFullYear();
