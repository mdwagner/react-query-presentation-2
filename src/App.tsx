import { Outlet, NavLink } from "react-router-dom";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

function App() {
  const navigation = [
    {
      name: "React (useState/useEffect)",
      href: "react-vanilla",
    },
    { name: "Redux (Traditional)", href: "redux-traditional" },
    { name: "Redux Toolkit", href: "redux-toolkit" },
    { name: "React Query (Basic)", href: "react-query-basic" },
    {
      name: "React Query (Advanced)",
      href: "react-query-advanced",
    },
  ];

  return (
    <>
      <div className="flex">
        <div className="flex flex-col w-64 min-h-screen">
          <div className="flex flex-col flex-grow border-r border-gray-200 bg-white overflow-y-auto">
            <div className="mt-5 flex-grow flex flex-col">
              <nav
                className="flex-1 px-2 space-y-8 bg-white"
                aria-label="Sidebar"
              >
                <div className="space-y-1">
                  {navigation.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={({ isActive }) =>
                        classNames(
                          isActive
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                          "group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                        )
                      }
                    >
                      {item.name}
                    </NavLink>
                  ))}
                </div>
              </nav>
            </div>
          </div>
        </div>
        <div className="flex-1 p-4">
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default App;
