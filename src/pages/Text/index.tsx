/* eslint-disable @typescript-eslint/no-unused-vars */
import { Divider, Card, Row, Col, Radio, Table, Select, Tooltip, Input, Collapse, Slider, Modal } from 'antd';
import React, { useState, useEffect } from 'react';
import { WarningOutlined } from '@ant-design/icons';
import { NodeInfo, Response, GPUInfo } from './data'
import { Area, Line } from '@ant-design/charts';
import moment from 'moment';
import { ColumnsType } from 'antd/lib/table/interface';

const { Panel } = Collapse;


const GPUPanel: React.FC<{ info: { gpu: GPUInfo, time: string }[] }> = ({ info }) => {
  const [tab, setTab] = useState("util");
  var fan_speed_list = info.map((v) => {
    return {
      time: moment(Date.parse(v.time)).format("MM/DD HH:mm:ss "),
      speed: parseInt(v.gpu.fan_speed.substring(0, v.gpu.fan_speed.length - 2))
    }
  }).reverse()
  var gpu_util_list = info.map((v) => {
    return {
      time: moment(Date.parse(v.time)).format("MM/DD HH:mm:ss "),
      gpu_util: parseInt(v.gpu.utilization.gpu_util.substring(0, v.gpu.utilization.gpu_util.length - 2))
    }
  }).reverse()
  var mem_util_list = info.map((v) => {
    return {
      time: moment(Date.parse(v.time)).format("MM/DD HH:mm:ss "),
      mem_util: parseInt(v.gpu.fb_memory_usage.used.substring(0, v.gpu.fb_memory_usage.used.length - 4))
    }
  }).reverse()
  var mem_max = parseInt(info[0].gpu.fb_memory_usage.total.substring(0, info[0].gpu.fb_memory_usage.total.length - 4))
  var fan_config = {
    data: fan_speed_list,
    padding: "auto" as const,
    xField: 'time',
    yField: 'speed',
    yAxis: {
      max: 100,
      maxLimit: 100,
      min: 0,
    },
    xAxis: {},
    tooltip: {
      showTitle: true,
      formatter: (x: any) => {
        return { name: "风扇转速", value: x.speed + " %" }
      }
    },
  };
  var gpu_util_config = {
    data: gpu_util_list,
    padding: "auto" as const,
    xField: 'time',
    yField: 'gpu_util',
    yAxis: {
      max: 100,
      maxLimit: 100,
      min: 0,
    },
    tooltip: {
      showTitle: true,
      formatter: (x: any) => {
        return { name: "显卡占用", value: x.gpu_util + " %" }
      }
    },
  };
  var mem_util_config = {
    data: mem_util_list,
    padding: "auto" as const,
    xField: 'time',
    yField: 'mem_util',
    yAxis: {
      maxLimit: mem_max
    },
    tooltip: {
      showTitle: true,
      formatter: (x: any) => {
        return {
          name: "显存占用率",
          value: `${x.mem_util} MB / ${mem_max} MB (${(x.mem_util / mem_max * 100).toFixed(1)}%)`
        }
      }
    },
  };
  const columns: ColumnsType<{
    pid: string;
    process_name: string;
    type: string;
    used_memory: string;
    user: string;
  }> = [
      {
        title: 'PID',
        dataIndex: 'pid',
        key: 'pid',
      },
      {
        title: '用户',
        dataIndex: 'user',
        key: 'user',
      },
      {
        title: '占用显存',
        dataIndex: 'used_memory',
        key: 'used_memory',
        sorter: (a, b) => {
          var x = parseInt(a.used_memory.substring(0, a.used_memory.length - 4))
          var y = parseInt(b.used_memory.substring(0, b.used_memory.length - 4))
          return x - y
        },
        defaultSortOrder: "descend"
      },
      {
        title: '进程名',
        dataIndex: 'process_name',
        key: 'process_name',
      },
    ];
  var zombie = true;
  for (var mem of mem_util_list) {
    if (mem.mem_util / mem_max < 0.1) {
      zombie = false;
      break;
    }
  }
  for (var util of gpu_util_list) {
    if (util.gpu_util > 10) {
      zombie = false;
      break
    }
  }
  console.log(zombie)
  return (
    <Row style={{ height: "100%", margin: "20px 0 20px 0" }} justify="space-around" align="middle">
      <Col span={4} >
        {zombie &&
          <Tooltip title="疑似显存被占用但长时间没有使用">
            <WarningOutlined style={{ color: "red", fontSize: "30px" }} />
          </Tooltip>
        }
        <div> {info[0].gpu.product_name}</div>
        <Radio.Group value={tab} style={{ marginTop: "10px" }} onChange={(e) => { setTab(e.target.value) }}>
          <Radio.Button value="util">使用情况</Radio.Button>
          <Radio.Button value="process">进程占用</Radio.Button>
        </Radio.Group>
      </Col>
      {tab == "util" &&
        <Col span={20} style={{ height: "100%" }}>

          <Row justify="space-around" align="middle">
            <Col span={2}>显卡占用</Col>
            <Col span={22}>
              <Line {...gpu_util_config} height={100} /></Col>
          </Row>
          <Row style={{ marginTop: "20px" }} justify="space-around" align="middle">
            <Col span={2}>显存占用</Col>
            <Col span={22}>
              <Area  {...mem_util_config} height={100} /></Col>
          </Row>
          {/* <Row style={{ marginTop: "20px" }} justify="space-around" align="middle">
            <Col span={2}>风扇转速</Col>
            <Col span={22}>
              <Line {...fan_config} height={100} /></Col>
          </Row> */}
        </Col>
      }
      {tab == "process" &&
        <Col span={20} style={{ height: "100%" }}>

          <Table
            dataSource={info[0].gpu.processes.process_info}
            columns={columns}
            pagination={{ hideOnSinglePage: true }}
          ></Table>
        </Col>
      }
    </Row>
  )
};

const NodePanel: React.FC<{ name: string, node: NodeInfo[] }> = ({ name, node }) => {
  var gpu_list: { [uuid: string]: { gpu: GPUInfo, time: string }[] } = {};
  for (var n of node) {
    var gpu = n.stat.gpu;
    for (var info of gpu) {
      if (info.uuid in gpu_list) {
        gpu_list[info.uuid].push({ gpu: info, time: n.time })
      } else {
        gpu_list[info.uuid] = [{ gpu: info, time: n.time }]
      }
    }
  }
  return (
    <>

      {
        Object.keys(gpu_list).map((k, i) => {
          if (i != 0) {
            return (
              <>
                <Divider></Divider>
                <GPUPanel info={gpu_list[k]} key={i}></GPUPanel>

              </>
            );
          } else {
            return (
              <GPUPanel info={gpu_list[k]} key={i}></GPUPanel>
            );
          }
        })
      }

    </>
  )
}

function GPUMonitor() {
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
  return <Card>
    <Collapse accordion>
      {
        Object.keys(data).map((k, i) => (
          <Panel header={k} key={i}>
            <NodePanel name={k} node={data[k]} key={i}></NodePanel>
          </Panel>
        ))
      }
    </Collapse>
  </Card >
}



export default GPUMonitor;
