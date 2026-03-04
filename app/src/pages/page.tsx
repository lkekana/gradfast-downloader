"use client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Module, modules } from "@/data";
import Image from "next/image";
import { useState } from "react";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import ConnectButton from "@/components/ConnectButton";

type ModuleChecked = {
  module: Module;
  checked: boolean;
}

export default function Home() {
  // sort lexographically by prefix then numerically by code
  const sortedModules = modules.sort((a, b) => {
    if (a.prefix === b.prefix) {
      return a.code - b.code;
    }
    return a.prefix.localeCompare(b.prefix);
  });

  const [modulesList, setModulesList] = useState<ModuleChecked[]>(sortedModules.map((m) => ({ module: m, checked: false })));

  const handleCheckedChange = (key: string, checked: boolean) => {
    setModulesList(prev =>
      prev.map(item =>
        `${item.module.prefix}${item.module.code}` === key
          ? { ...item, checked }
          : item
      )
    );
  };

  const handleDownload = () => {
    const selectedModules = modulesList.filter(m => m.checked).map(m => m.module);
    console.log("Downloading modules:", selectedModules);
    alert(`Downloading modules: ${selectedModules.map(m => `${m.prefix}${m.code}`).join(", ")}`);
  }


  const makeCards = () => {
    return modulesList.map((m) => (
        <Card key={`${m.module.prefix}${m.module.code}`} className="w-full max-w-md" >
        <CardHeader>
          <CardTitle>{m.module.prefix}{m.module.code}</CardTitle>
          <CardDescription>{m.module.name}</CardDescription>
        </CardHeader>
        <Field orientation="horizontal">
          <Checkbox id={`checkbox-${m.module.prefix}${m.module.code}`} checked={m.checked} onCheckedChange={(val) => handleCheckedChange(`${m.module.prefix}${m.module.code}`, Boolean(val))}/>
          <FieldLabel htmlFor={`checkbox-${m.module.prefix}${m.module.code}`}>
            Include
          </FieldLabel>
        </Field>
        
        {/* <CardContent>
          <p>Credits: 16</p>
          <p>Period: Year</p>
        </CardContent> */}
        <CardFooter className="flex justify-end">
          <a
            href={`/modules/${m.module.prefix}${m.module.code}`}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            View details
          </a>
        </CardFooter>
      </Card>
    ));
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-11/12 flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
      <h1>Modules</h1>
      {/* <Button className="mb-4" onClick={handleDownload}>
        Download Selected Modules
      </Button>
      <div className="grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {makeCards()}
        </div> */}
        {/* <ConnectButton  /> */}
      </main>
    </div>
  );
}
