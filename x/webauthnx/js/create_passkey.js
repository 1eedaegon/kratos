// Copyright © 2023 Ory Corp
// SPDX-License-Identifier: Apache-2.0

;(function () {
  if (!window) {
    return
  }

  if (!window.PublicKeyCredential) {
    alert("This browser does not support WebAuthn!")
  }

  function __oryWebAuthnBufferDecode(value) {
    return Uint8Array.from(
      atob(value.replaceAll("-", "+").replaceAll("_", "/")),
      function (c) {
        return c.charCodeAt(0)
      },
    )
  }

  function __oryWebAuthnBufferEncode(value) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(value)))
      .replaceAll("+", "-")
      .replaceAll("/", "_")
      .replaceAll("=", "")
  }

  document.addEventListener("DOMContentLoaded", () => {
    const dataEl = document.getElementsByName("create_passkey_data")[0]
    const resultEl = document.getElementsByName("passkey_register")[0]

    if (!dataEl || !resultEl) {
      console.log("mandatory fields not found")
      return
    }

    let opt = JSON.parse(dataEl.value)

    opt.publicKey.user.id = __oryWebAuthnBufferDecode(opt.publicKey.user.id)
    opt.publicKey.challenge = __oryWebAuthnBufferDecode(opt.publicKey.challenge)

    if (opt.publicKey.excludeCredentials) {
      opt.publicKey.excludeCredentials = opt.publicKey.excludeCredentials.map(
        function (value) {
          return {
            ...value,
            id: __oryWebAuthnBufferDecode(value.id),
          }
        },
      )
    }

    navigator.credentials
      .create(opt)
      .then(function (credential) {
        resultEl.value = JSON.stringify({
          id: credential.id,
          rawId: __oryWebAuthnBufferEncode(credential.rawId),
          type: credential.type,
          response: {
            attestationObject: __oryWebAuthnBufferEncode(
              credential.response.attestationObject,
            ),
            clientDataJSON: __oryWebAuthnBufferEncode(
              credential.response.clientDataJSON,
            ),
          },
        })

        document
          .querySelector('*[type="submit"][name="method"][value="passkey"]')
          .click()
      })
      .catch((err) => {
        alert(err)
      })
  })
})()
