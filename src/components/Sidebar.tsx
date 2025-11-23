import { Link, useNavigate } from "react-router-dom";
import { useHasPermission } from "../hooks/usePermissions";
import { useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";

const Sidebar = () => {
  // const canViewUsers = useHasPermission('user.view')
  const canViewLogs = useHasPermission('logs.view')
  const navigate = useNavigate()
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/dashboard/'); // or '/' or any page you want
  };
  return (
    <div className="drawer z-50">
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
        <div className="menu bg-base-200 text-base-content min-h-full w-80 p-4 relative z-50">
          <label
            htmlFor="my-drawer"
            className="btn btn-sm btn-circle absolute right-4 top-4"
          >
            ✕
          </label>

          {/* Menu Items */}
          <ul className="menu mt-12 gap-0 [&>li:not(:first-child)]:border-t [&>li:not(:first-child)]:border-base-300 w-full">
            {/* {canViewUsers && (
              <li>
                <Link to="/dashboard/users">Users</Link>
              </li>
            )} */}
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
              <Link to="/dashboard/role">Roles</Link>
            </li>
            <li>
              <Link to="/dashboard/permissions">Permissions</Link>
            </li>
            <li>
              <Link to="/dashboard/items">Shop Items</Link>
            </li>
            <li>
              <Link to="/dashboard/game-items-type">Game Item Types</Link>
            </li>
            <li>
              <Link to="/dashboard/game-items">Game Items</Link>
            </li>
            <li>
              <Link to="/dashboard/element">Elements</Link>
            </li>
            <li>
              <Link to="/dashboard/assets">Assets</Link>
            </li>
            {canViewLogs && (
              <>
                <li>
                  <Link to="/dashboard/shop-history">Shop History</Link>
                </li>
                <li>
                  <Link to="/dashboard/transaction-log">Transaction Log</Link>
                </li>
              </>
            )}
            <li className="mt-5">
              <button className="btn btn-error" onClick={handleLogout}>Logout</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
