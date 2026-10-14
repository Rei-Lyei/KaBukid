(() => {
  'use strict';
  const session = window.KaBukidSession;
  if (!session) return;
  const $ = s => document.querySelector(s);
  const farmers = [
    {id:'vegetables',name:'Mang Ramon',farm:'Ramon Family Farm',products:'Sitaw, talong, kangkong & carrots'},
    {id:'fruits',name:'Aling Rosa',farm:'Rosa Fruit Orchard',products:'Avocado, grapes & dragon fruit'},
    {id:'crops',name:'Mang Ben',farm:'Ben Harvest Farm',products:'Bigas, beans, munggo & corn'}
  ];
  const categories = {sitaw:'vegetables',talong:'vegetables',kangkong:'vegetables',carrots:'vegetables',avocado:'fruits',grapes:'fruits',dragonfruit:'fruits',bigas:'crops',blackbeans:'crops',munggo:'crops',corn:'crops'};
  const key = 'kabukid-demo-chats-v1';
  let active = 'vegetables', perspective = session.role, pending = new Map();
  const buyerName = session.role === 'buyer' ? session.name : 'Sample Buyer';
  function samples() {
    return Object.fromEntries(farmers.map(f => [f.id,[
      {role:'buyer',text:'Hello po! May available pa po ba kayong fresh produce?',time:Date.now()-120000},
      {role:'farmer',text:`Hello! Welcome to ${f.farm}. Available po ang ${f.products.toLowerCase()}. What would you like to order?`,time:Date.now()-60000}
    ]]));
  }
  let threads = samples();
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (saved) farmers.forEach(f => {
      if (Array.isArray(saved[f.id])) threads[f.id] = saved[f.id].filter(m => m && ['buyer','farmer'].includes(m.role) && typeof m.text === 'string' && Number.isFinite(m.time));
    });
  } catch (_) {}
  function save() { try {localStorage.setItem(key,JSON.stringify(threads));} catch (_) {} }
  function render() {
    const farmer = farmers.find(f => f.id === active);
    $('#chatPerson').textContent = perspective === 'buyer' ? farmer.name : buyerName;
    $('#chatFarm').textContent = farmer.farm + ' · ' + farmer.products;
    $('#buyerView').setAttribute('aria-pressed',String(perspective === 'buyer'));
    $('#farmerView').setAttribute('aria-pressed',String(perspective === 'farmer'));
    $('#chatInput').placeholder = perspective === 'buyer' ? 'Write to the farmer…' : 'Reply to the buyer…';
    $('#chatHistory').replaceChildren();
    threads[active].forEach(m => {
      const bubble = document.createElement('div');
      bubble.className = 'chat-bubble' + (m.role === perspective ? ' mine' : '');
      const meta = document.createElement('small');
      meta.textContent = (m.role === 'farmer' ? farmer.name : buyerName) + ' · ' + new Date(m.time).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
      const body = document.createElement('p'); body.textContent = m.text;
      bubble.append(meta,body); $('#chatHistory').append(bubble);
    });
    $('#chatHistory').scrollTop = $('#chatHistory').scrollHeight;
    document.querySelectorAll('.chat-contact').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.farmer === active)));
  }
  farmers.forEach(f => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'chat-contact'; b.dataset.farmer = f.id;
    const name = document.createElement('strong');name.textContent = f.name;
    const subtitle = document.createElement('span');subtitle.textContent = f.farm;
    b.append(name,subtitle); b.addEventListener('click',() => {active=f.id;$('#chatInput').value='';render();});
    $('#chatContacts').append(b);
  });
  function open(id) {
    if (id) active=id;
    render();
    if (!$('#chatDialog').open) $('#chatDialog').showModal();
    $('#chatInput').focus();
  }
  $('#messagesBtn').addEventListener('click',() => open());
  $('#chatLaunch').addEventListener('click',() => open());
  $('#closeChat').addEventListener('click',() => $('#chatDialog').close());
  $('#chatDialog').addEventListener('click',e => {
    if (e.target !== $('#chatDialog')) return;
    const r = e.target.getBoundingClientRect();
    if (e.clientX<r.left || e.clientX>r.right || e.clientY<r.top || e.clientY>r.bottom) e.target.close();
  });
  document.addEventListener('click',e => {
    const b = e.target.closest('[data-chat-product]');
    if (!b) return;
    open(categories[b.dataset.chatProduct]);
    const product = b.closest('.card').querySelector('h3').textContent;
    $('#chatInput').value = 'Hello po! Is '+product+' still available?';
  });
  function changeView(role) {pending.forEach(clearTimeout);pending.clear();perspective=role;render();}
  $('#buyerView').addEventListener('click',() => changeView('buyer'));
  $('#farmerView').addEventListener('click',() => changeView('farmer'));
  function send(text) {
    text=text.trim();if (!text) return;
    const id=active, sender=perspective;
    threads[id].push({role:sender,text,time:Date.now()});save();render();$('#chatInput').value='';$('#chatInput').focus();
    if (!$('#autoReply').checked) return;
    if (pending.has(id)) clearTimeout(pending.get(id));
    pending.set(id,setTimeout(() => {
      pending.delete(id);
      let reply = 'Salamat po! Please let me know the product and quantity you need, and we can arrange your order.';
      if (sender==='farmer') reply='Thank you po! I would like to confirm the quantity and delivery details before ordering.';
      else if (/deliver|shipping|address/i.test(text)) reply='Our sample delivery fee is ₱50, and delivery is free for orders of ₱500 or more. Where would you like it delivered?';
      else if (/bulk|discount|wholesale/i.test(text)) reply='Yes po, we accept bulk orders! Please tell me the product and quantity so we can discuss availability and pricing.';
      else if (/available|stock|fresh/i.test(text)) reply='Yes po, available pa! You can check the sample stock on the product card. How many would you like?';
      else if (/price|how much|magkano/i.test(text)) reply='The sample price is listed on each product card, per kilo, bundle or sack. Which product are you interested in?';
      threads[id].push({role:sender==='buyer'?'farmer':'buyer',text:reply,time:Date.now()});save();if(active===id)render();
    },850));
  }
  $('#autoReply').addEventListener('change',() => {if(!$('#autoReply').checked){pending.forEach(clearTimeout);pending.clear();}});
  $('#chatForm').addEventListener('submit',e => {e.preventDefault();send($('#chatInput').value);});
  document.querySelectorAll('[data-quick]').forEach(b => b.addEventListener('click',() => send(b.dataset.quick)));
  $('#resetChat').addEventListener('click',() => {pending.forEach(clearTimeout);pending.clear();threads=samples();save();render();});
  render();
})();
