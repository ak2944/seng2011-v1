import { useRef, useState } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"
import DespatchAdviceGenerator from "../despatch/DespatchGenerate"
import React from "react"


export default function Dashboard() {
    return (
      <div className="p-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button>Upload or Fetch Order</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[1000px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
            </DialogHeader>
  
            <DespatchAdviceGenerator />
  
            <DialogFooter>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* ... any other Dashboard UI ... */}
      </div>
    )
  }