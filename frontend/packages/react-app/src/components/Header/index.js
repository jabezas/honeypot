import React from "react"
import styled from "styled-components"
import header from "./header-bg.png"
import logo from "./honeypot-logo.png"
import metaMaskLogo from "./metamask-logo.png"

const StyledHeader = styled.div`
  height: 200px;
  width: 100%;
  background: no-repeat url(${header});
`

const LogoContainer = styled.div`
  padding-top: 2rem;
  margin-left: 4rem;
  margin-right: 4rem;
  display: flex;
  justify-content: space-between;
`

const Logo = styled.div`
  height: 80px;
  width: 160px;
  background: no-repeat url(${logo});
  background-origin: content-box;
`

const UserPill = styled.div`
  height: 40px;
  min-width: 120px;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  background: white;
  color: black;
  border-radius: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
`

const MetaMaskLogo = styled.div`
  height: 22px;
  width: 22px;
  margin-left: 16px;
  background: no-repeat url(${metaMaskLogo});
  background-origin: content-box;
`

const Header = ({ userAddress, userBalance }) => {
  console.log({ userAddress, userBalance })
  return (
    <StyledHeader>
      <LogoContainer>
        <Logo />
        <UserPill>
          {/* TODO format */}
          {Math.round(Number(userBalance))} ETH
          <MetaMaskLogo />
        </UserPill>
      </LogoContainer>
    </StyledHeader>
  )
}

export default Header
