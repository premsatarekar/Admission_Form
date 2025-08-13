import React, { useState } from 'react';
import VizionexlForm from './VizionexlForm';
import KaushalKendraForm from './KaushalKendraForm';

export default function ToggleForm() {
  const [active, setActive] = useState('vizionexl');

  return (
    <div>
      <div className="btn-group mb-4 d-flex" role="group">
        <button
          type="button"
          className={`btn ${active === 'vizionexl' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setActive('vizionexl')}
        >
          Vizionexl Technologies
        </button>
        <button
          type="button"
          className={`btn ${active === 'kaushal' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setActive('kaushal')}
        >
          Kaushal Kendra
        </button>
      </div>

      {active === 'vizionexl' ? <VizionexlForm /> : <KaushalKendraForm />}
    </div>
  );
}
