import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="drawer">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        {/* Hamburger Button */}
        <label tabIndex={0} className="btn btn-ghost" htmlFor="my-drawer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </label>
      </div>

      <div className="drawer-side">
        <label
          htmlFor="my-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
          data-theme="bumblebee"
        ></label>
        <div className="menu bg-base-200 text-base-content min-h-full w-80 p-4 relative">
          <label
            htmlFor="my-drawer"
            className="btn btn-sm btn-circle absolute right-4 top-4"
          >
            ✕
          </label>

          {/* Menu Items */}
          <ul className="menu mt-12 gap-0 [&>li:not(:first-child)]:border-t [&>li:not(:first-child)]:border-base-300 w-full">
            <li>
              <Link to="/dashboard/users">Users</Link>
            </li>
            <li>
              <Link to="/dashboard/songs">Songs</Link>
            </li>
            <li>
              <Link to="/dashboard/quotes">Quotes</Link>
            </li>
            <li>
              <Link to="/dashboard/cards">Cards</Link>
            </li>
            <li>
              <Link to="/dashboard/items">Shop Items</Link>
            </li>
            <li>
              <Link to="/dashboard/shop-history">Shop History</Link>
            </li>
            <li>
              <Link to="/dashboard/transaction-log">Transaction Log</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
