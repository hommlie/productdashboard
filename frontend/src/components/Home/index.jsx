import Layout from "../Layout";

const Home = () => {
  return (
    <Layout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome back, Admin</h1>
          <p className="text-gray-500 mt-1">Here's a quick overview of your premium dashboard.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700">New Report</button>
          <button className="px-4 py-2 bg-white border rounded-lg">Export</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {["Total Products", "Orders", "Revenue", "Customers"].map((title, i) => (
          <div key={i} className="bg-white p-5 rounded-xl shadow-md hover:shadow-xl transition">
            <p className="text-gray-500 text-sm">{title}</p>
            <h2 className="text-2xl font-bold mt-2">{i === 2 ? "$0" : "0"}</h2>
            <p className="text-sm text-green-500 mt-2">+0% vs last week</p>
          </div>
        ))}
      </div>

      <section className="mt-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold">Recent Orders</h3>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left table-auto">
              <thead>
                <tr className="text-sm text-gray-500">
                  <th className="py-2">Order</th>
                  <th className="py-2">Customer</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
