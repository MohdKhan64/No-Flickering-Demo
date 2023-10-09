import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import "./styles.css";
import { navigationItems } from "./items";

const rightGap = 10;

const getLastVisibleItem = ({ necessaryWidths, containerWidth, moreWidth }) => {
  if (!necessaryWidths?.length) return 0;

  if (necessaryWidths[necessaryWidths.length - 1] < containerWidth) {
    return necessaryWidths.length - 1;
  }

  const visibleItems = necessaryWidths.filter((width) => {
    return width + moreWidth < containerWidth;
  });

  return visibleItems.length ? visibleItems.length - 1 : 0;
};

const getPrecalculatedWidths = (element) => {
  const { width: containerWidth, left: containerLeft } =
    element.getBoundingClientRect();
  const children = Array.from(element.childNodes);

  let moreWidth = 0;
  const necessaryWidths = children.reduce((result, node) => {
    if (node.getAttribute("id") === "more") {
      moreWidth = node.getBoundingClientRect().width;
      return result;
    }

    const rect = node.getBoundingClientRect();
    const width = rect.width + (rect.left - containerLeft) + rightGap;

    return [...result, width];
  }, []);

  return {
    moreWidth,
    necessaryWidths,
    containerWidth,
  };
};

const MenuComponent = ({ items }) => {
  const ref = useRef(null);
  const [lastVisibleMenuItem, setLastVisibleMenuItem] = useState(-1);
  const [dimensions, setDimensions] = useState({
    necessaryWidths: [],
    moreWidth: 0,
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown

  useLayoutEffect(() => {
    if (!ref.current) return;
    const { moreWidth, necessaryWidths, containerWidth } =
      getPrecalculatedWidths(ref.current);

    const itemIndex = getLastVisibleItem({
      containerWidth,
      necessaryWidths,
      moreWidth,
    });
    setDimensions({ moreWidth, necessaryWidths });
    setLastVisibleMenuItem(itemIndex);
  }, []);

  useEffect(() => {
    const listener = () => {
      if (!ref.current) return;
      const newIndex = getLastVisibleItem({
        containerWidth: ref.current.getBoundingClientRect().width,
        necessaryWidths: dimensions.necessaryWidths,
        moreWidth: dimensions.moreWidth,
      });

      if (newIndex !== lastVisibleMenuItem) {
        setLastVisibleMenuItem(newIndex);
      }
    };

    window.addEventListener("resize", listener);

    return () => {
      window.removeEventListener("resize", listener);
    };
  }, [lastVisibleMenuItem, dimensions, ref]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const moreButtonElement = (
    <button className="navigation-button" id="more" onClick={toggleDropdown}>
      ...
    </button>
  );

  const isMoreVisible = lastVisibleMenuItem < items.length - 1;
  const filteredItems = items.filter(
    (item, index) => index <= lastVisibleMenuItem
  );

  if (lastVisibleMenuItem === -1) {
    return (
      <div className="navigation" ref={ref}>
        {items.map((item) => (
          <a href={item.href} key={item.id} className="navigation-button">
            {item.name}
          </a>
        ))}
        {isMoreVisible && moreButtonElement}
        {isDropdownOpen && (
          <div className="dropdown">
            {/* Render hidden items in the dropdown */}
            {items.slice(lastVisibleMenuItem + 1).map((item) => (
              <a href={item.href} key={item.id} className="navigation-button">
                {item.name}
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="navigation" ref={ref}>
      {filteredItems.map((item) => (
        <a href={item.href} key={item.id} className="navigation-button">
          {item.name}
        </a>
      ))}
      <div className="column">
        {isMoreVisible && moreButtonElement}
        {isDropdownOpen && (
          <div className="dropdown">
            {/* Render hidden items in the dropdown */}
            {items.slice(lastVisibleMenuItem + 1).map((item) => (
              <a href={item.href} key={item.id} className="navigation-button">
                {item.name}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <div className="App">
      <h1>Responsive navigation example</h1>
      <p>Resize the window to see how navigation adjusts the number of items</p>
      <MenuComponent items={navigationItems} />
    </div>
  );
}
