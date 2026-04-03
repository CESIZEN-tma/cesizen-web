export interface RouteConfig {
  name: string;
  path: string;
  layout?: "default" | null;
  header?: boolean;
  footer?: boolean;
  component: React.ReactNode;
}


export interface LayoutConfig {
  header?: boolean;
  footer?: boolean;
}

export type LayoutProps = React.PropsWithChildren<{
  config: LayoutConfig 
}>