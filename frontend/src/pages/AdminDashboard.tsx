const AdminDashboard = () => {
  return (
    <div className="container mt-4">
      <h2>🛡️ Admin Dashboard</h2>

      <div className="row g-3">
        <div className="col-md-4">
          <div className="card p-3 shadow">
            <h5>Users</h5>
            <p>Manage platform users</p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-3 shadow">
            <h5>Articles</h5>
            <p>Moderate news articles</p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-3 shadow">
            <h5>Analytics</h5>
            <p>View system statistics</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
