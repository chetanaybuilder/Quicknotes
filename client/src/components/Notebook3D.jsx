import { useEffect, useRef } from 'react';

export default function Notebook3D() {
  const el = useRef();

  useEffect(() => {
    let t;
    const onMove = (e) => {
      if (t) return;
      t = requestAnimationFrame(() => {
        if (!el.current) return;
        const r = el.current.getBoundingClientRect();
        const px = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        const py = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        el.current.style.setProperty('--px', Math.max(-1, Math.min(1, px)));
        el.current.style.setProperty('--py', Math.max(-1, Math.min(1, py)));
        t = null;
      });
    };
    const onLeave = () => { if (el.current) { el.current.style.setProperty('--px', 0); el.current.style.setProperty('--py', 0); } };
    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    return () => { window.removeEventListener('mousemove', onMove); document.removeEventListener('mouseleave', onLeave); if (t) cancelAnimationFrame(t); };
  }, []);

  return (
    <div className="nb" ref={el} aria-hidden="true">
      <div className="nb__shadow" />
      <div className="nb__book">
        <div className="nb__cover" />
        <div className="nb__page nb__page--3" />
        <div className="nb__page nb__page--2" />
        <div className="nb__page nb__page--1">
          <b>Ideas</b>
          <i /><i className="s" /><i /><i className="s" /><i />
        </div>
        <div className="nb__ribbon" />
        <div className="nb__card nb__card--a"><b>Journal</b><i className="s" /><i /></div>
        <div className="nb__card nb__card--b"><b>Research</b><i /><i className="s" /></div>
      </div>
    </div>
  );
}
