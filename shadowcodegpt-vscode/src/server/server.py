import json
from pygls.server import LanguageServer
from lsprotocol.types import (DidOpenTextDocumentParams, MessageType)


class EchoLanguageServer(LanguageServer):
    def __init__(self, *args):
        super().__init__(*args, name="ShadowCodeGPT", version="1.0.0")


echo_server = EchoLanguageServer()


@echo_server.feature("textDocument/didOpen")
async def did_open(ls, params: DidOpenTextDocumentParams):
    """Text document did open notification."""
    ls.show_message('Text Document Did Open', MessageType.Info)
    ls.show_message_log(f'Document opened: {params.textDocument.uri}', MessageType.Log)


@echo_server.feature("workspace/executeCommand")
async def execute_command(ls, params):
    """Echo back the same message."""
    command_info = json.dumps(params, indent=2)
    ls.show_message(f'Received command', MessageType.Info)
    ls.show_message_log(f'Detailed command info:\n{command_info}', MessageType.Log)
    ls.log(f'Debugging command info: {command_info}')
    return params


if __name__ == '__main__':
    echo_server.start_io()
