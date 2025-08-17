// Add JSX namespace declaration to make MDX types work properly
import React from 'react';

declare global {
  namespace JSX {
    interface Element extends React.ReactElement<any, any> {}
    interface ElementClass extends React.Component<any, any> {
      render(): React.ReactNode;
    }
    interface ElementAttributesProperty {
      props: {};
    }
    interface ElementChildrenAttribute {
      children: {};
    }
    interface IntrinsicElements extends React.JSX.IntrinsicElements {}
  }
}

export {};
