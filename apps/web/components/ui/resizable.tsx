"use client"

import * as React from "react"

export const ResizablePanelGroup = ({ className, children, ...props }: any) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}

export const ResizablePanel = ({ className, children, ...props }: any) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}

export const ResizableHandle = ({ className, children, ...props }: any) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}
