import React from 'react';
import { Layout, LocaleProvider } from 'antd';
import enUS from 'antd/lib/locale-provider/en_US';

const { Header, Content } = Layout;

export default function ControlApp({ children }) {
  return (
    <LocaleProvider locale={enUS}>
      <Layout>
        <Header>
          <h1>Control 2</h1>
        </Header>
        <Content className="content">
          {children}
        </Content>
      </Layout>
    </LocaleProvider>
  );
}
