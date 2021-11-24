import React, { FC } from "react";
import { AutoSizer, List, ListRowRenderer } from "react-virtualized";

export const FileTree = () => {
  const rowRenderer: ListRowRenderer = (params) => {
    return <p>hello</p>;
  };

  return (
    <AutoSizer>
      {({ height, width }) => (
        <List
          height={height}
          width={width}
          overscanRowCount={30}
          noRowsRenderer={() => <p>nothing!</p>}
          rowCount={10}
          rowHeight={26}
          rowRenderer={rowRenderer}
          // scrollToIndex={scrollToIndex}
        />
      )}
    </AutoSizer>
  );
};
