/* Tipografía de artículo — server-safe, sin hooks */

export function P({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-[17px] leading-[1.85] text-[color:var(--art-body)] tracking-wide ${className}`}>{children}</p>;
}

export function Lead({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={`text-[17px] leading-[1.85] text-[color:var(--art-body)] tracking-wide first-letter:text-[64px] first-letter:font-extralight first-letter:float-left first-letter:leading-[0.8] first-letter:mr-3 first-letter:mt-1 first-letter:text-foreground ${className}`}
    >
      {children}
    </p>
  );
}

export function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[2rem] sm:text-[2.5rem] font-extralight tracking-tight leading-[1.15] text-foreground mb-7">
      {children}
    </h2>
  );
}

export function Strong({ children }: { children: React.ReactNode }) {
  return <span className="text-foreground font-medium">{children}</span>;
}
