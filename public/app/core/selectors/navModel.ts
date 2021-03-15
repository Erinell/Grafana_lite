import { NavModel, NavModelItem, NavIndex } from '@grafana/data';

const getNotFoundModel = (): NavModel => {
  const node: NavModelItem = {
    id: 'not-found',
    text: 'Page non trouvée',
    icon: 'exclamation-triangle',
    subTitle: 'Erreur 404',
    url: 'not-found',
  };

  return {
    node: node,
    main: node,
  };
};

export const getNavModel = (navIndex: NavIndex, id: string, fallback?: NavModel, onlyChild = false): NavModel => {
  if (navIndex[id]) {
    const node = navIndex[id];

    let main: NavModelItem;
    if (!onlyChild && node.parentItem) {
      main = { ...node.parentItem };

      main.children =
        main.children &&
        main.children.map((item) => {
          return {
            ...item,
            active: item.url === node.url,
          };
        });
    } else {
      main = node;
    }

    return {
      node,
      main,
    };
  }

  if (fallback) {
    return fallback;
  }

  return getNotFoundModel();
};

export const getTitleFromNavModel = (navModel: NavModel) => {
  return `${navModel.main.text}${navModel.node.text ? ': ' + navModel.node.text : ''}`;
};
