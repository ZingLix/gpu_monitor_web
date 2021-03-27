/* eslint-disable @typescript-eslint/no-unused-vars */
import { Divider, Card, Row, Col, Form, Table, Select, Switch, Input, message, Slider, Modal } from 'antd';
import React, { useState, useEffect } from 'react';

import { Dispatch } from 'redux';
import { StateType } from './model';
import { NodeInfo, Response, GPUInfo } from './data'

import { PageContainer } from '@ant-design/pro-layout';

function CurrentUsage() {
  const [data, setData] = useState<Response>({});
  useEffect(() => {
    asyncFetch();
  }, []);
  const asyncFetch = () => {
    fetch('/api/history')
      .then((response) => response.json())
      .then((json) => setData(json))
      .catch((error) => {
        console.log('fetch data failed', error);
      });
  };
  var config = {
    data: data,
    xField: 'Date',
    yField: 'scales',
    xAxis: { tickCount: 5 },
    areaStyle: function areaStyle() {
      return { fill: 'l(270) 0:#ffffff 0.5:#7ec2f3 1:#1890ff' };
    },
  };
  const gridStyle = {
    width: '25%',
    textAlign: 'center' as const,
  };
  return <PageContainer><Card>
    {
      Object.keys(data).map((k, i) => (
        <Card title={k}>
          {
            data[k][0].stat.gpu.map((k, i) => {
              var used = parseInt(k.fb_memory_usage.used.substring(0, k.fb_memory_usage.used.length - 4));
              var total = parseInt(k.fb_memory_usage.total.substring(0, k.fb_memory_usage.total.length - 4));
              var util = parseInt(k.utilization.gpu_util.substring(0, k.utilization.gpu_util.length - 2));
              var color = "";
              if (used / total > 0.85 || util > 80) {
                color = "#ffa39e"
              } else if (used / total < 0.15) {
                color = "#b7eb8f"
              } else {
                color = "#ffd591"
              }
              return (
                <Card.Grid style={{ backgroundColor: color }}>
                  {k.product_name}&nbsp;&nbsp;&nbsp; {util}%<br />{used}MB / {total}MB ( {(used / total * 100).toFixed(1)} %)
                </Card.Grid>
              )
            })
          }
        </Card>
        // < NodePanel name={k} node={data[k]} key={i}></NodePanel>
      ))
    }

  </Card ></PageContainer>
}



export default CurrentUsage;
