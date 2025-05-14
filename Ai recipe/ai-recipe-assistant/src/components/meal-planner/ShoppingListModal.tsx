import React, { useState } from 'react';
import styles from './ShoppingListModal.module.css';
import type { Ingredient } from '../../types';

// Define the type for a shopping list item
interface ShoppingListItem {
  name: string;
  quantity?: string[];
}

// Define the type for the shopping list object
export type ShoppingList = {
  [category: string]: ShoppingListItem[];
};

function downloadPDF(list: ShoppingList) {
  // Simple PDF export using window.print (for demo)
  const win = window.open('', '', 'width=600,height=800');
  if (!win) return;
  win.document.write('<html><head><title>Shopping List</title></head><body>');
  win.document.write('<h2>Shopping List</h2>');
  Object.keys(list).forEach(cat => {
    win.document.write(`<h3>${cat}</h3><ul>`);
    list[cat].forEach(item => {
      win.document.write(`<li>${item.name} ${item.quantity && item.quantity[0] ? `(${item.quantity[0]})` : ''}</li>`);
    });
    win.document.write('</ul>');
  });
  win.document.write('</body></html>');
  win.document.close();
  win.print();
}

function mailList(list: ShoppingList) {
  let body = 'Shopping List:\n';
  Object.keys(list).forEach(cat => {
    body += `\n${cat}:\n`;
    list[cat].forEach(item => {
      body += `- ${item.name} ${item.quantity && item.quantity[0] ? `(${item.quantity[0]})` : ''}\n`;
    });
  });
  window.location.href = `mailto:?subject=Shopping List&body=${encodeURIComponent(body)}`;
}

const CATEGORY_ORDER = ['Produce', 'Dairy', 'Protein', 'Grains', 'Pantry', 'Other'];

interface ShoppingListModalProps {
  open: boolean;
  onClose: () => void;
  shoppingList: ShoppingList;
}

const ShoppingListModal: React.FC<ShoppingListModalProps> = ({ open, onClose, shoppingList }) => {
  const [checked, setChecked] = useState<{ [name: string]: boolean }>({});
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleCheck = (name: string) => {
    setChecked(c => ({ ...c, [name]: !c[name] }));
  };

  const categories = CATEGORY_ORDER.filter(cat => shoppingList[cat] && shoppingList[cat].length > 0)
    .concat(Object.keys(shoppingList).filter(cat => !CATEGORY_ORDER.includes(cat)));

  const handleExportPDF = () => {
    setLoading(true);
    downloadPDF(shoppingList);
    setToast('PDF exported!');
    setTimeout(() => setToast(''), 2000);
    setLoading(false);
  };

  const handleEmail = () => {
    setLoading(true);
    mailList(shoppingList);
    setToast('Email sent!');
    setTimeout(() => setToast(''), 2000);
    setLoading(false);
  };

  return (
    <div className={styles.overlay} aria-live="polite">
      <div className={styles.modal}>
        <button className={styles.close} onClick={onClose} aria-label="Close shopping list">×</button>
        <h2 className={styles.heading}>Shopping List</h2>
        {categories.length === 0 && <div className={styles.empty} role="alert">No ingredients planned yet.</div>}
        {categories.map(cat => (
          <div key={cat} className={styles.categorySection}>
            <h3 className={styles.category}>{cat}</h3>
            <ul className={styles.list}>
              {shoppingList[cat].map(item => (
                <li key={item.name} className={styles.item}>
                  <label className={styles.label}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={!!checked[item.name]}
                      onChange={() => handleCheck(item.name)}
                    />
                    <span className={checked[item.name] ? styles.checked : ''}>{item.name}</span>
                    {item.quantity && item.quantity[0] && (
                      <span className={styles.qty}>({item.quantity[0]})</span>
                    )}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className={styles.actions}>
          <button className={styles.btn} onClick={handleExportPDF} disabled={loading}>{loading ? <span className={styles.spinner} aria-label="Loading"></span> : 'Export PDF'}</button>
          <button className={styles.btn} onClick={handleEmail} disabled={loading}>{loading ? <span className={styles.spinner} aria-label="Loading"></span> : 'Email'}</button>
        </div>
        {toast && <div className={styles.toast} role="status" aria-live="polite">{toast}</div>}
      </div>
    </div>
  );
};

export default ShoppingListModal; 
