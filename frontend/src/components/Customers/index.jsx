import Layout from "../Layout";

const Customers = () => {
  return (
    <Layout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome to Customers</h1>
          <p className="text-gray-500 mt-1">Manage your customer information.</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700">
          Add Customer
        </button>
      </div>

      <div className="mt-6 bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Customer Management</h2>
        <p className="text-gray-600">Browse and manage all your customers</p>
      </div>
    </Layout>
  );
};

export default Customers;
