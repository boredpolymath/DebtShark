const $ = id => document.getElementById(id);
const format = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.max(0, value || 0));
const number = id => Math.max(0, parseFloat($(id).value) || 0);

function calculate(amount, apr, months, fees = 0) {
  const rate = apr / 1200;
  const payment = rate ? amount * rate * Math.pow(1 + rate, months) / (Math.pow(1 + rate, months) - 1) : amount / months;
  const paid = payment * months;
  return { payment, paid, interest: paid - amount, cost: paid - amount + fees, fees };
}

function current() {
  return {
    amount: number('amount'), apr: number('apr'), term: Math.max(1, number('term')), fees: number('fees'),
    refinance: $('refinance').checked, balloon: $('balloon').checked, auto: $('auto-pay').checked
  };
}

function drawFlags(values) {
  const flags = [];
  if (values.apr >= 20) flags.push(['Higher-cost rate', 'The rate entered is 20% APR or more. Compare the total repayment amount with at least one other offer.', 'REVIEW']);
  else if (values.apr >= 12) flags.push(['Compare your rate', 'Ask whether you qualify for a lower rate or a shorter term. Even small rate changes can matter.', 'CHECK']);
  if (values.fees > values.amount * .04) flags.push(['Upfront fees add up', `${format(values.fees)} in fees equals ${((values.fees / values.amount) * 100).toFixed(1)}% of the amount borrowed. Confirm which fees are required and whether they are financed.`, 'REVIEW']);
  if (values.term >= 72) flags.push(['Long repayment period', `A ${values.term}-month term can reduce the payment while increasing total interest and time in debt.`, 'CHECK']);
  if (values.refinance) flags.push(['Refinancing or extension', 'Compare the remaining cost of your current loan against this offer’s full cost before you replace it.', 'PAUSE']);
  if (values.balloon) flags.push(['Balloon payment', 'Confirm the amount and due date of the final payment, and ask what happens if you cannot make it.', 'PAUSE']);
  if (!flags.length) flags.push(['No automatic warning triggered', 'The terms entered did not meet this prototype’s review thresholds. Still read the disclosures and compare total costs.', 'INFO']);
  const out = $('flags');
  out.replaceChildren();
  const template = $('flag-template');
  flags.slice(0, 3).forEach(flag => {
    const node = template.content.cloneNode(true);
    node.querySelector('.flag-title').textContent = flag[0];
    node.querySelector('.flag-copy').textContent = flag[1];
    node.querySelector('.flag-level').textContent = flag[2];
    out.append(node);
  });
  $('risk-label').textContent = flags.length > 1 ? 'REVIEW' : 'CHECK';
  $('flag-summary').textContent = flags.length > 1 ? `${flags.length} items deserve a closer look before you decide.` : 'Use these questions to review the offer carefully.';
}

function analyze() {
  const values = current();
  const costs = calculate(values.amount, values.apr, values.term, values.fees);
  $('monthly-payment').innerHTML = `${format(costs.payment).replace('$', '<span>$</span>').replace(/(\d{1,3})(?=(\d{3})*$)/, '$1')}<span>${(costs.payment % 1).toFixed(2).substring(1)}</span>`;
  $('total-paid').textContent = format(costs.paid + values.fees);
  $('interest-paid').textContent = format(costs.interest);
  const creditCost = costs.interest + values.fees;
  const principalShare = values.amount ? Math.max(3, Math.min(97, (values.amount / (values.amount + creditCost)) * 100)) : 50;
  $('principal-bar').style.width = `${principalShare}%`;
  $('principal-label').textContent = format(values.amount);
  $('cost-label').textContent = format(creditCost);
  $('compare-current-payment').textContent = `${format(costs.payment)}/mo`;
  $('compare-current-apr').textContent = `${values.apr.toFixed(2)}%`;
  $('compare-current-cost').textContent = format(costs.paid + values.fees);
  $('compare-current-term').textContent = `${values.term} months`;
  drawFlags(values);
  return { v: values, c: costs };
}

function compare(event) {
  if (event) event.preventDefault();
  const { v, c } = analyze();
  const alternative = calculate(number('alt-amount'), number('alt-apr'), Math.max(1, number('alt-term')));
  const difference = (c.paid + v.fees) - alternative.paid;
  $('savings').textContent = `${difference >= 0 ? '' : '−'}${format(Math.abs(difference))}`;
  $('savings-copy').textContent = difference >= 0 ? 'less in total borrowing cost with the alternative offer.' : 'more in total borrowing cost with the alternative offer.';
}

function saved() {
  try {
    const records = JSON.parse(localStorage.getItem('bps-analyses') || '[]');
    return Array.isArray(records) ? records : [];
  } catch {
    return [];
  }
}

function renderSaved() {
  const list = $('saved-list');
  const data = saved();
  $('saved-count').textContent = data.length;
  if (!data.length) {
    list.innerHTML = '<div class="empty-state"><strong>No records saved yet.</strong><br>Use a Save button anywhere in the suite to keep a snapshot on this device.</div>';
    return;
  }
  list.innerHTML = data.map((entry, index) => `<article class="saved-item"><span class="saved-date">${new Date(entry.date).toLocaleDateString()}</span><div><strong>${format(entry.v.amount)} loan offer</strong><br><small>${entry.v.apr.toFixed(2)}% APR · ${entry.v.term} months</small></div><div class="saved-meta"><span>${format(entry.c.payment)}/mo</span><span>${format(entry.c.paid + entry.v.fees)} total</span><button data-load="${index}">Open</button><button class="delete-save" data-delete="${index}">Delete</button></div></article>`).join('');
  list.querySelectorAll('[data-load]').forEach(button => button.onclick = () => {
    const entry = data[button.dataset.load];
    ['amount', 'apr', 'term', 'fees'].forEach(key => $(key).value = entry.v[key]);
    $('refinance').checked = entry.v.refinance;
    $('balloon').checked = entry.v.balloon;
    $('auto-pay').checked = entry.v.auto;
    analyze();
    show('analyzer');
  });
  list.querySelectorAll('[data-delete]').forEach(button => button.onclick = () => {
    data.splice(button.dataset.delete, 1);
    localStorage.setItem('bps-analyses', JSON.stringify(data));
    renderSaved();
  });
}

function show(view) {
  document.querySelectorAll('.view').forEach(section => section.classList.toggle('active', section.id === view));
  const navView = view === 'collections-detail' ? 'learning' : view;
  document.querySelectorAll('.nav-link').forEach(button => {
    const isActive = button.dataset.view === navView;
    button.classList.toggle('active', isActive);
    button.toggleAttribute('aria-current', isActive);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (view === 'saved') renderSaved();
}

document.querySelectorAll('.nav-link').forEach(button => button.onclick = () => show(button.dataset.view));
$('loan-form').onsubmit = event => { event.preventDefault(); analyze(); };
$('comparison-form').onsubmit = compare;
$('load-sample').onclick = () => { $('amount').value = 18000; $('apr').value = 24.99; $('term').value = 84; $('fees').value = 1295; $('refinance').checked = true; analyze(); };
$('save-analysis').onclick = () => {
  const result = analyze();
  const data = saved();
  data.unshift({ ...result, date: Date.now() });
  localStorage.setItem('bps-analyses', JSON.stringify(data));
  renderSaved();
  $('save-analysis').innerHTML = 'Saved to this device <span>✓</span>';
  setTimeout(() => { $('save-analysis').innerHTML = 'Save analysis <span>+</span>'; }, 1800);
};
$('clear-data').onclick = () => { if (confirm('Delete saved analyses from this device?')) { localStorage.removeItem('bps-analyses'); renderSaved(); } };
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
analyze();
renderSaved();
