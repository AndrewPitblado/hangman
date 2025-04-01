# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# NO CHECKED-IN PROTOBUF GENCODE
# source: hangman.proto
# Protobuf Python Version: 5.29.0
"""Generated protocol buffer code."""
from google.protobuf import descriptor as _descriptor
from google.protobuf import descriptor_pool as _descriptor_pool
from google.protobuf import runtime_version as _runtime_version
from google.protobuf import symbol_database as _symbol_database
from google.protobuf.internal import builder as _builder
_runtime_version.ValidateProtobufRuntimeVersion(
    _runtime_version.Domain.PUBLIC,
    5,
    29,
    0,
    '',
    'hangman.proto'
)
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()




DESCRIPTOR = _descriptor_pool.Default().AddSerializedFile(b'\n\rhangman.proto\x12\x07hangman\"$\n\rPlayerRequest\x12\x13\n\x0bplayer_name\x18\x01 \x01(\t\"3\n\x0cGuessRequest\x12\x13\n\x0bplayer_name\x18\x01 \x01(\t\x12\x0e\n\x06letter\x18\x02 \x01(\t\"~\n\tGameState\x12\x15\n\rword_progress\x18\x01 \x01(\t\x12\x1a\n\x12remaining_attempts\x18\x02 \x01(\x05\x12\x17\n\x0fguessed_letters\x18\x03 \x03(\t\x12\x14\n\x0cis_game_over\x18\x04 \x01(\x08\x12\x0f\n\x07message\x18\x05 \x01(\t\" \n\rLeaveResponse\x12\x0f\n\x07message\x18\x01 \x01(\t2\xfb\x01\n\x0eHangmanService\x12\x36\n\x08JoinGame\x12\x16.hangman.PlayerRequest\x1a\x12.hangman.GameState\x12\x38\n\x0bGuessLetter\x12\x15.hangman.GuessRequest\x1a\x12.hangman.GameState\x12:\n\x0cGetGameState\x12\x16.hangman.PlayerRequest\x1a\x12.hangman.GameState\x12;\n\tLeaveGame\x12\x16.hangman.PlayerRequest\x1a\x16.hangman.LeaveResponseb\x06proto3')

_globals = globals()
_builder.BuildMessageAndEnumDescriptors(DESCRIPTOR, _globals)
_builder.BuildTopDescriptorsAndMessages(DESCRIPTOR, 'hangman_pb2', _globals)
if not _descriptor._USE_C_DESCRIPTORS:
  DESCRIPTOR._loaded_options = None
  _globals['_PLAYERREQUEST']._serialized_start=26
  _globals['_PLAYERREQUEST']._serialized_end=62
  _globals['_GUESSREQUEST']._serialized_start=64
  _globals['_GUESSREQUEST']._serialized_end=115
  _globals['_GAMESTATE']._serialized_start=117
  _globals['_GAMESTATE']._serialized_end=243
  _globals['_LEAVERESPONSE']._serialized_start=245
  _globals['_LEAVERESPONSE']._serialized_end=277
  _globals['_HANGMANSERVICE']._serialized_start=280
  _globals['_HANGMANSERVICE']._serialized_end=531
# @@protoc_insertion_point(module_scope)
