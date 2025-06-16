import * as React from "react";


export default function RolePage()  {
  return (
    <div style={{ padding: '20px' }}>
      <header style={{ marginBottom: '20px' }}>
        <h1>Role</h1>
      </header>
      <footer style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #eee', textAlign: 'center' }}>
        <p>&copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};
