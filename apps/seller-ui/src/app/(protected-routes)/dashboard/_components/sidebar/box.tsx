"use client"


import React from 'react'

import styled from "styled-components"

interface BoxProps {
    $css?: React.CSSProperties
}

const Box = styled.div.attrs<BoxProps>((props) => ({
    style: props.$css,
})) <BoxProps>`
box-sizing: border-box;
`
export default Box
