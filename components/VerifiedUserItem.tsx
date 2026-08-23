'use client'

import VerifiedUserItemConsumer from "./VerifiedUserItemConsumer"
import VerifiedUserProvider from "./VerifiedUserProvider"

export default function VerifiedUserItem(props: {
  verifiedUserId: string
}) {
  return (
    <VerifiedUserProvider verifiedUserId={props.verifiedUserId}>
      <VerifiedUserItemConsumer />
    </VerifiedUserProvider>
  )
}