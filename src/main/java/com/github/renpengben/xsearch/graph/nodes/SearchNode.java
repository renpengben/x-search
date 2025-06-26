package com.github.renpengben.xsearch.graph.nodes;

import com.alibaba.cloud.ai.graph.OverAllState;
import com.alibaba.cloud.ai.graph.action.NodeAction;
import com.github.renpengben.xsearch.search.SearchService;
import com.github.renpengben.xsearch.search.SearchService.SearchResponse;
import java.util.List;
import java.util.Map;

/**
 * 搜索节点
 */
public class SearchNode implements NodeAction {

  private SearchService searchService;

  public SearchNode(SearchService searchService) {
    this.searchService = searchService;
  }

  @Override
  public Map<String, Object> apply(OverAllState state) {
    String query = (String) state.value("query").orElse("");
    List<SearchResponse> searchResponse = searchService.search(query);
    return Map.of("searchResponse", searchResponse);
  }
}
