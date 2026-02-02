from typing import List, TypedDict
from dataclasses import dataclass


# Output from /categories
class ModuleCategoryDict(TypedDict):
    name: str
    description: str


@dataclass(frozen=True)
class ModuleCategory:
    name: str
    description: str


def parse_categories(data: List[ModuleCategoryDict]) -> List[ModuleCategory]:
    return [ModuleCategory(**item) for item in data]


# Output from /modules
class ModuleDict(TypedDict):
    prefix: str
    code: int
    name: str


@dataclass(frozen=True)
class Module:
    prefix: str
    code: int
    name: str


def parse_modules(data: List[ModuleDict]) -> List[Module]:
    return [Module(**item) for item in data]


# Output from /module/{module_code}
class ModuleInfoDict(TypedDict):
    prefix: str
    code: int
    name: str
    credits: str
    period: str
    prerequisites: List[str]


@dataclass(frozen=True)
class ModuleInfo:
    prefix: str
    code: int
    name: str
    credits: str
    period: str
    prerequisites: List[str]


def parse_module_info(data: ModuleInfoDict) -> ModuleInfo:
    return ModuleInfo(**data)


# Output from /module/{module_code}/past-papers
class PastPaperDict(TypedDict):
    category: str
    version: str
    description: str
    year: str
    memo: str
    url: str


@dataclass(frozen=True)
class PastPaper:
    category: str
    version: str
    description: str
    year: str
    memo: str
    url: str


def parse_past_papers(data: List[PastPaperDict]) -> List[PastPaper]:
    return [PastPaper(**item) for item in data]
