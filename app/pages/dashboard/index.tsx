import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";
import {Card, CardBody, CardHeader, Input, Select} from "@heroui/react";
import {Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button} from "@heroui/react";
import {ServersChart} from "@/components/charts/serversChart";
import {Option} from "lucide-react";


export default function Home() {
    let [token,setToken] = useState(null);
    let [url,setUrl] = useState(null);
    let router = useRouter();

    let [data,setData] = useState({
        type: "hour"
    } as any);
    let [fromDate, setFromDate] = useState(new Date().getTime()-60*1000*5)
    let [toDate, setToDate] = useState(new Date().getTime());


    useEffect(()=> {
        let servers = JSON.parse(localStorage?.getItem("servers") || "[]");
        let id = parseInt(router.query.server as string) || 0;
        let server = servers[id];
        if(server) {
            setToken(server.token);
            setUrl(server.url);
        }
        else
            setToken(null);

        if(token != null) {
            fetch(url + '/api/stats/all?from=' + fromDate + '&to=' + toDate, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': 'Bearer ' + token
                }
            }).then(response => response.json()).then((dat) => setData({...data, ...dat}))
        }
    }, [router.query, router, fromDate, toDate]);

    if(!token) {
        return (<div className="flex flex-col items-center justify-center py-2 h-screen min-w-96 w-96 max-w-96">Server does not exist. Please go back.</div>)
    }

    return (
        <div className="flex flex-col gap-4 p-4">
            <Card className={"h-[500px]"}>
                <CardHeader>Small Chart</CardHeader>
                <CardBody>
                    <Input type="datetime-local" value={
                        new Date(fromDate).toISOString().slice(0, 16)
                    } onChange={(e) => setFromDate(new Date(e.target.value).getTime())} />
                    <Input type="datetime-local" value={
                        new Date(toDate).toISOString().slice(0, 16)
                    } onChange={(e) => setToDate(new Date(e.target.value).getTime())} />
                    <Dropdown>
                        <DropdownTrigger>
                            <Button className="capitalize" variant="bordered">
                                {data.type || "Select Type"}
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            disallowEmptySelection
                            aria-label="Time unit"
                            selectedKeys={data.type}
                            selectionMode="single"
                            variant="flat"
                            onSelectionChange={(e : any) => {
                                //e is set of strings
                                setData({...data, type: e[0]});
                            }}>
                            <DropdownItem key="minute">Minute</DropdownItem>
                            <DropdownItem key="hour">Hour</DropdownItem>
                            <DropdownItem key="day">Day</DropdownItem>
                            <DropdownItem key="week">Week</DropdownItem>
                            <DropdownItem key="month">Month</DropdownItem>
                            <DropdownItem key="year">Year</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                    <ServersChart data={data} />
                </CardBody>
            </Card>
            <Card>
                <CardHeader>Large Chart</CardHeader>
                <CardBody>
                </CardBody>
            </Card>
            <Card>
                <CardHeader>Table</CardHeader>
                <CardBody>
                </CardBody>
            </Card>
        </div>
    );
}
