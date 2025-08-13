import { useState } from 'react';
import {
  FiChevronDown,
  FiChevronUp,
  FiDatabase,
  FiFileText,
  FiHome,
  FiList,
  FiLogIn,
  FiMenu,
  FiX,
} from 'react-icons/fi';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [formsOpen, setFormsOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleForms = () => setFormsOpen(!formsOpen);
  const toggleList = () => setListOpen(!listOpen);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <>
      {/* Mobile Hamburger Menu */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md bg-gray-800 text-white"
        >
          {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out z-40 bg-gray-800 text-white w-64`}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <button
              onClick={toggleSidebar}
              className="hidden lg:block p-1 rounded hover:bg-gray-700"
            >
              {isOpen ? '◀' : '▶'}
            </button>
          </div>

          <nav className="flex-1">
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="flex items-center p-3 rounded hover:bg-gray-700"
                >
                  <FiHome className="mr-3" size={20} />
                  <span>Dashboard</span>
                </a>
              </li>

              <li>
                <button
                  onClick={toggleForms}
                  className="flex items-center justify-between w-full p-3 rounded hover:bg-gray-700"
                >
                  <div className="flex items-center">
                    <FiFileText className="mr-3" size={20} />
                    <span>Forms</span>
                  </div>
                  {formsOpen ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {formsOpen && (
                  <ul className="ml-8 mt-2 space-y-2">
                    <li>
                      <a
                        href="#"
                        className="block p-2 rounded hover:bg-gray-700"
                      >
                        Kushal Kendra
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="block p-2 rounded hover:bg-gray-700"
                      >
                        Vixionexl
                      </a>
                    </li>
                  </ul>
                )}
              </li>

              <li>
                <button
                  onClick={toggleList}
                  className="flex items-center justify-between w-full p-3 rounded hover:bg-gray-700"
                >
                  <div className="flex items-center">
                    <FiList className="mr-3" size={20} />
                    <span>List</span>
                  </div>
                  {listOpen ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {listOpen && (
                  <ul className="ml-8 mt-2 space-y-2">
                    <li>
                      <a
                        href="#"
                        className="block p-2 rounded hover:bg-gray-700"
                      >
                        Kushal Kendra List
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="block p-2 rounded hover:bg-gray-700"
                      >
                        Vixionexl List
                      </a>
                    </li>
                  </ul>
                )}
              </li>

              <li>
                <a
                  href="#"
                  className="flex items-center p-3 rounded hover:bg-gray-700"
                >
                  <FiDatabase className="mr-3" size={20} />
                  <span>Take Backup</span>
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="flex items-center p-3 rounded hover:bg-gray-700"
                >
                  <FiLogIn className="mr-3" size={20} />
                  <span>Login</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
