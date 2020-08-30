import fetch from "cross-fetch"
import { useMemo } from "react"
import { ApolloClient, InMemoryCache } from "@apollo/client"

let apolloClient

function createIsomorphLink() {
  /* istanbul ignore next */
  if (typeof window === "undefined") {
    const { SchemaLink } = require("@apollo/client/link/schema")
    const { schema } = require("./schema")
    return new SchemaLink({ schema })
  } else {
    const { HttpLink } = require("@apollo/client/link/http")
    return new HttpLink({
      uri: "/api/graphql",
      credentials: "same-origin",
      fetch,
    })
  }
}

function createApolloClient() {
  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    link: createIsomorphLink(),
    cache: new InMemoryCache(),
  })
}

export function initializeApollo(initialState = null) {
  const _apolloClient = apolloClient ?? createApolloClient()

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // get hydrated here
  if (initialState) {
    _apolloClient.cache.restore(initialState)
  }
  // For SSG and SSR always create a new Apollo Client
  /* istanbul ignore next */
  if (typeof window === "undefined") return _apolloClient
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient

  return _apolloClient
}

/* istanbul ignore next */
export function useApollo(initialState) {
  const store = useMemo(() => initializeApollo(initialState), [initialState])
  return store
}
