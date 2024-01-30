import React from "react";
import { ResponsiveMasonry } from "react-responsive-masonry";
import Masonry from "react-responsive-masonry";

function CustomMasonry({ children }: { children: React.ReactNode[] }) {
  return (
    <ResponsiveMasonry
      columnsCountBreakPoints={{ 576: 1, 800: 2, 960: 3, 1100: 4 }}
    >
      <Masonry gutter="1.25rem">{children}</Masonry>
    </ResponsiveMasonry>
  );
}

export default CustomMasonry;
