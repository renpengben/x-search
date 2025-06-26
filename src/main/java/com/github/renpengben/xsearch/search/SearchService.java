package com.github.renpengben.xsearch.search;


import java.util.List;

public interface SearchService {
  Integer REFERENCE_COUNT=8;
  List<SearchResponse> search(String query);

  record SearchResponse(String title,
                        String url,
                        String snippet) {

  }
}