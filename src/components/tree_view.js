import * from 'components/tree_view';

export default new ComponentDef({
  path: 'std.TreeView',
  render: new Element({
    path: 'std.Block',
    layout: new Layout({
      path: 'std.FreeformLayout',
    }),
  })
});
